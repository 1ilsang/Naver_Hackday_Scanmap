/**
 * Created by Naver on 2016. 6. 27..
 */
naver.maps.scan.Draw = function () {
    this._Data = naver.maps.scan.Data;

    this.drawMarker = function(coord, imageUrl) {
        var marker = new naver.maps.Marker({
            position: coord,
            map: map,
            icon: {
                url: imageUrl
                , animation: naver.maps.Animation.DROP
                , zIndex : 100
            },
            draggable: true
        });

        if (marker.getAnimation() !== null) {
            marker.setAnimation(null);
        } else {
            marker.setAnimation(naver.maps.Animation.DROP);
        }

        return marker;
    }

    this.removeMarker = function() {
        $.each(this._Data.peopleList.length, function( index, people ) {
            if(people.marker)
                people.marker.setMap(null);
        })
    }

    this.drawMeetMarker = function() {
        var self = this;
        $.each(this._Data.meetPositions, function( index, meet ) {

            meet.marker = new naver.maps.Marker({
                map: map,
                position: new naver.maps.Point(meet.x, meet.y),
                icon: {
                    url: "/img/arrow/STAR" + (index+1) + ".PNG"
                }
            });
            
            naver.maps.Event.addListener(meet.marker, "click", $.proxy(function(e) {
                naver.maps.scan.Data.selectPosition.marker.setIcon({url :naver.maps.scan.Data.selectPosition.marker.getIcon().url.replace("S.PNG", ".PNG")});
                this.marker.setIcon({url :this.marker.getIcon().url.replace(".PNG", "S.PNG")});

                self.removePolyline();
                self._Data.selectPosition = this;
                self.drawPolyline();
                side.changeData(self._Data.selectPosition);
            }, meet));

        });
    }

    this.removeMeetMarker = function() {
        $.each(this._Data.meetPositions, function( index, meet ) {
            if(meet.marker)
                meet.marker.setMap(null);
        });
    }

    this.drawPolyline = function() {
        var loadInfo = this._Data.selectPosition.loadInfo;
        if(!loadInfo) {
            return;
        }
        for (var idx in loadInfo) {
            var path = loadInfo[idx].path;

            var icon = this._Data.peopleList[idx].marker.getIcon();
            if(path.length == 0) {
                icon.url = icon.url.replace('_q.png', '.png').replace('.png', '_q.png');
            }else {
                icon.url = icon.url.replace('_q.png', '.png');
            }
            this._Data.peopleList[idx].marker.setIcon(icon);

            loadInfo[idx].polyline = new naver.maps.Polyline({
                map: map,
                path: path,
                strokeWeight: 5,
                strokeOpacity: 0.8,
                strokeColor: naver.maps.scan.VALUE.COLOR_LIST[idx]
            });

            bus.move(loadInfo[idx], idx);
//            var busCoords = [];
//            for (var i in path) {
//                var busMarker = new naver.maps.Marker({
//                    position: new naver.maps.Point(path[i].x, path[i].y),
//                    map: map,
//                    icon: {
//                        content : '<img src="/img/traffic_BUS.PNG">'
//                    }
//                    , visible: false
//                });
//                busCoords.push(busMarker);
//            }
//
//            var time = loadInfo[idx].totalTime*100/(busCoords.length);//total;
//            busCoords.forEach(function (a, index) {
//                var current = busCoords[index];
//                if (index != busCoords.length - 1)
//                    var next = busCoords[index + 1];
//                setTimeout(function (a) {
//                    current.setVisible(false);
//                    if (next)
//                        next.setVisible(true);
//                }, time * index, current, next);
//            });
        }
    }

    this.removePolyline = function() {
        var loadInfo = this._Data.selectPosition.loadInfo;
        if(!loadInfo) {
            return;
        }

        $.each(loadInfo, function(index, value){
            if(value.polyline)
                value.polyline.setMap(null);
            $.each(value.busCoords, function(innerIndex, innerValue){
                innerValue.setMap(null);
            });
        });
        for (var idx in loadInfo) {
            
        }
    }

    this.draw = $.proxy(function() {
        this.drawMeetMarker();
        this._Data.selectPosition.marker.setIcon({url: this._Data.selectPosition.marker.getIcon().url.replace(".PNG", "S.PNG")});
        this.drawPolyline();
        $("#loading").hide();
    }, this)

    this.remove = function() {
        this.removePolyline();
        this.removeMeetMarker();
    }
}
