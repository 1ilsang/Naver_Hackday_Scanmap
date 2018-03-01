naver.maps.scan.Search = function () {
    this._Data = naver.maps.scan.Data;

    this.searchLoad = function(meetPosition) {
        var deferreds = [];
        for (var i=0, ii=this._Data.peopleList.length; i<ii; i++) {
            var start = this._Data.peopleList[i].marker.getPosition();
            deferreds.push($.ajax({
                dataType: 'json',
                url: '/findroute2/searchPubtransPath.nhn',
                data : {apiVersion: '3', searchType: '0', start: start.x + ',' + start.y + ',' + 's', destination: meetPosition.x + ',' + meetPosition.y + ',' + 'd'}
            }));
        }

        return $.when.apply($, deferreds).then($.proxy(function(){
            this.loadInfo = [];
            this.totalTime = 0;
            this.totalPeople = 0;
            var doubleSum = 0;
            var deferreds = [];

            for(var idx in arguments) {
                var result = arguments[idx][0].result;

                if(!result || !result.path || !result.path[0]) {
                    $("#loading").hide();
                    console.log("길찾기 실패");
                    meetPosition.loadInfo[idx] = {};
                    deferreds.push([{}]);
                    continue;
                }

                this.loadInfo[idx] = result.path[0].info;
                var eachTime = parseInt(result.path[0].info.totalTime);
                this.totalTime += eachTime;
                doubleSum += (eachTime * eachTime);
                this.totalPeople++;
                var param = result.path[0].info.mapObj;
                var startSplit = result.start.split(',');
                var endSplit = result.end.split(',');
                var position = startSplit[0] + ',' + startSplit[1] + ','+ endSplit[0] + ','+ endSplit[1];

                deferreds.push($.ajax({
                    dataType: 'json',
                    url: '/findroute2/inquirePubtransInterpolationPoints.nhn',
                    data : {param: param, position: position}
                }));
            }
            this.variance = doubleSum / arguments.length - Math.pow((this.totalTime / arguments.length) , 2);

            return $.when.apply($, deferreds);
        },meetPosition)).then($.proxy(function(){
            for(var idx in arguments) {
                var result = arguments[idx][0].result;

                if(!result || !result.lanes[0]) {
                    console.log("선정보 찾기 실패");
                    this.loadInfo[idx].path = [];
                    continue;
                }
                var path = [];
                var list = result.lanes[0].lane;

                for(var i in list) {
                    var list2 = list[i].section.graphPos;
                    for(var j in list2) {
                        var coord =naver.maps.UTMK_NAVER.fromNaverToCoord(new naver.maps.Point(list2[j].x, list2[j].y));
                        path.push(coord);
                    }
                }
                this.loadInfo[idx].path = path;
            }

            return this;
        },meetPosition));
        
    }
}