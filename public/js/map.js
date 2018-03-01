var init_map = function() {
    var map = new naver.maps.Map('map', {
        zoom: 11,
        mapTypeControl: true
    });
    var markerList = [];
    var markerCnt = 0;
    var markerCenter;
    var centerCircle;
    var centerChk = false;
    var item;
    var placeMarkerList = [];

    window.openMap = function openMap(f) {
            var myaddress = f.firAddr.value; // 도로명 주소나 지번 주소만 가능 (건물명 불가!!!!)
            naver.maps.Service.geocode({
                address: myaddress
            }, function(status, response) {

                if (status !== naver.maps.Service.Status.OK) {
                    return alert(myaddress + '의 검색 결과가 없거나 기타 네트워크 에러');
                }

                var result = response.result;
                var myaddr = new naver.maps.Point(result.items[0].point.x, result.items[0].point.y);

                map.setCenter(myaddr); // 검색된 좌표로 지도 이동
                //이전에 마크가 찍혀있는지 확인_있다면 center 처리만 하고 return
                for (var i = 0; i < markerList.length; i++) {
                    if (markerList[i].position.x == myaddr.x && markerList[i].position.y == myaddr.y) {
                        var markerChk = true;
                        break;
                    }
                }

                if (markerChk == true) return;
                // 마커 표시
                var marker = new naver.maps.Marker({
                    position: new naver.maps.LatLng(myaddr),
                    map: map,
                    title: markerCnt++,
                    // icon:'imgURL',
                    animation: naver.maps.Animation.BOUNCE
                });

                markerList.push(marker);

                console.log('m' + markerCnt + ' x : ' + myaddr.x + ' y : ' + myaddr.y);
                // 마커 클릭 이벤트 처리
                naver.maps.Event.addListener(marker, "click", function(e) {
                    if (infowindow.getMap()) {
                        infowindow.close();
                        marker.setAnimation(null);
                    } else {
                        infowindow.open(map, marker);
                        marker.setAnimation(naver.maps.Animation.BOUNCE);
                    }
                });

                // 마크 클릭시 인포윈도우 오픈
                var infowindow = new naver.maps.InfoWindow({
                    content: '<h5 class="black">' +
                        markerList.length +
                        '번째 사용자</h5><a href="https://1ilsang.blog.me" target="_blank"><img src=/img/mapImg/' +
                        markerList.length + '.png width=120px height=140px></a><br>'
                });
                infowindow.open(map, marker);
            });
        }
        /////////////////////////////////////////////////////
    window.clearMap = function clearMap() {
            for (var i = 0; i < markerList.length; i++) {
                markerList[i].setMap(null);
            }
            for (var i = 0; i < placeMarkerList.length; i++) {
                placeMarkerList[i].setMap(null);
            }
            placeMarkerList.splice(0, placeMarkerList.length);
            markerList.splice(0, markerList.length);
            markerChk = false;
            if (markerCenter != null) markerCenter.setMap(null);
            if (centerCircle != null) centerCircle.setMap(null);
            centerChk = false;
            markerCnt = 0;
        }
        ///////////////////////////////////////////////////////////////////////////////////////
    window.getCenterNopin = function getCenterNopin(Cx, Cy) {
            if (centerChk == true) {
                centerCircle.setMap(null);
                centerChk = false;
                markerCenter.setMap(null);
            }

            console.log('x : ' + Cx + ' y : ' + Cy);
            centerAddr = new naver.maps.Point(Cx, Cy);

            map.setCenter(centerAddr);
            markerCenter = new naver.maps.Marker({
                position: new naver.maps.LatLng(centerAddr),
                map: map,
                title: '원을 클릭해 보세요!',
                animation: naver.maps.Animation.DROP
            });

            centerCircle = new naver.maps.Circle({
                map: map,
                center: centerAddr,
                radius: 200,
                fillColor: '#69F499',
                fillOpacity: 0.8,
                clickable: true
            });
            centerChk = true;
            naver.maps.Event.addListener(centerCircle, 'mouseover', function() {
                centerCircle.setOptions({
                    fillColor: '#777777'
                });
            });
            naver.maps.Event.addListener(centerCircle, 'mouseout', function() {
                centerCircle.setOptions({
                    fillColor: '#69F499'
                });
            });
            naver.maps.Event.addListener(centerCircle, 'click', function() {
                var f = document.createElement("form"); // form 엘리멘트 생성 
                f.setAttribute("method", "post"); // method 속성 설정 
                f.setAttribute("action", "/map"); // action 속성 설정 
                document.body.appendChild(f); // 현재 페이지에 form 엘리멘트 추가 

                var cenX = centerAddr.x;
                var cenY = centerAddr.y;

                var i = document.createElement("input");
                i.setAttribute("type", "hidden");
                i.setAttribute("name", "cenX");
                i.setAttribute("value", cenX);
                f.appendChild(i);
                var j = document.createElement("input"); // input 엘리멘트 생성 
                j.setAttribute("type", "hidden"); // type 속성을 hidden으로 설정 
                j.setAttribute("name", "cenY");
                j.setAttribute("value", cenY);
                f.appendChild(j);
                var z = document.createElement("input");
                z.setAttribute("type", "hidden");
                z.setAttribute("name", "area");
                z.setAttribute("value", 100);
                f.appendChild(z);

                f.submit(); // 전송 
            });
        }
        ////////////////////////////////////////////////////////////////////////////
    window.searchCoordinateToAddress = function searchCoordinateToAddress(latlng) {
            //        var tm128 = naver.maps.TransCoord.fromLatLngToTM128(latlng);
            mouseInfoWindow.close();
            naver.maps.Service.reverseGeocode({
                location: latlng
                    //            coordType: naver.maps.Service.CoordType.TM128
            }, function(status, response) {
                if (status === naver.maps.Service.Status.ERROR) {
                    return alert('Something Wrong!');
                }

                var items = response.result.items,
                    htmlAddresses = [];
                for (var i = 0, ii = items.length, item, addrType; i < 1; i++) {
                    item = items[i];
                    addrType = item.isRoadAddress ? '[도로명 주소]' : '[지번 주소]';

                    htmlAddresses.push((i + 1) + '. ' + addrType + ' ' + item.address);
                    htmlAddresses.push('&nbsp -> ' + item.point.x + ',' + item.point.y);
                }

                mouseInfoWindow.setContent([
                    '<div style="padding:10px;width:200px;line-height:150%;">',
                    '<h4 style="margin-top:5px;">어떻게 할까요? </h4><br />',

                    "<button class='btn btn-blue ripple trial-button' onclick=makePinMouseInfoWindow(" + response.result.items[0].point.x + ',' + response.result.items[0].point.y + ")>여기에 핀 설정</button><br><br>",
                    '<button class="btn btn-blue ripple trial-button" onclick="closeMouseInfoWindow()">닫기</button>',
                    '</div>'
                ].join('\n'));

                mouseInfoWindow.open(map, latlng);
            });
        }
        ////////////////////////////////////////////////////////////////////////////////
    window.makePinMouseInfoWindow = function makePinMouseInfoWindow(addx, addy) {
            for (var i = 0; i < markerList.length; i++) {
                if (markerList[i].position.x == addx && markerList[i].position.y == addy) {
                    var markerChk = true;
                    break;
                }
            }
            //          console.log('item x : ' + addx + ' item y : ' + addy);
            if (markerChk == true) return;
            // 마커 표시
            var newPin = new naver.maps.Point(addx, addy);
            var marker = new naver.maps.Marker({
                position: new naver.maps.LatLng(newPin),
                map: map,
                title: markerCnt++,
                animation: naver.maps.Animation.BOUNCE
            });
            markerList.push(marker);
            //          console.log('m' + markerCnt + ' x : ' + myaddr.x + ' y : ' + myaddr.y);
            // 마커 클릭 이벤트 처리
            naver.maps.Event.addListener(marker, "click", function(e) {
                if (infowindow.getMap()) {
                    infowindow.close();
                    marker.setAnimation(null);
                } else {
                    infowindow.open(map, marker);
                    marker.setAnimation(naver.maps.Animation.BOUNCE);
                }
            });

            // 마크 클릭시 인포윈도우 오픈
            var infowindow = new naver.maps.InfoWindow({
                content: '<h4>' +
                    markerList.length +
                    ' 번째 사용자</h4><a href="https://1ilsang.blog.me" target="_blank"><img src=/img/mapImg/' +
                    markerList.length + '.png width=120px height=120px></a><br>'
            });
            infowindow.open(map, marker);
        }
        ////////////////////////////////////////////////////////////////////////////////
    window.initGeocoder = function initGeocoder() {
        map.addListener('click', function(e) {
            searchCoordinateToAddress(e.coord);
        });
        //          map.addListener('Lclick')
    }
    var mouseInfoWindow = new naver.maps.InfoWindow({
        anchorSkew: true,
        backgroundColor: '#fff'
            //          ,disableAnchor: true
    });
    naver.maps.onJSContentLoaded = initGeocoder;
    map.setCursor('pointer');
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    window.closeMouseInfoWindow = function closeMouseInfoWindow() {
            mouseInfoWindow.close();
        }
        //////////markersXYList////////////////////////////////
    window.markersXYList = function markersXYList(radio) {
        var chk = -1;
        var robj = document.getElementsByName(radio);
        for (var i = 0; i < robj.length; i++) {
            if (robj[i].checked == true) {
                chk = i;
                break;
            }
        }
        if (chk == -1) {
            alert("선택이 안되어 있습니다.");
            return false;
        }
        console.log(chk + ' : ' + radio[chk].value);
        var markerJsonListX = [];
        var markerJsonListY = [];
        for (var i = 0; i < markerList.length; i++) {
            markerJsonListX[i] = markerList[i].position.x;
            markerJsonListY[i] = markerList[i].position.y;
            // console.log(markerJsonList[i].x + ', ' + markerJsonList[i].y);
        }
        $.get('/getList', {
            "markerJsonListX": markerJsonListX,
            "markerJsonListY": markerJsonListY,
            "radioValue": robj[chk].value
        }, function(result) {
            var list_view = $('#list_view');
            var html = [
                '<table id="place_list">',
                '<thead>',
                '<tr>',
                '<td class="col-xs-1">인덱스</td>',
                '<td class="col-xs-8">장소 이름</td>',
                '<td class="col-xs-4">길찾기</td>',
                '</tr>',
                '</thead>',
                '<tbody>',
                '[DATA_ROW]',
                '</tbody>',
                '</table>'
            ].join('');
            var row_template = [
                '<tr class="place_el">',
                '<td class="col-xs-1">[INDEX]</td>',
                '<td class="col-xs-8">[NAME]</td>',
                '<td class="col-xs-4"><a href="#"><button class="btn btn-default view_position" data-title="[INDEX]" data-lat="[LAT]" data-lng="[LNG]"><i class="fa fa-map-marker"></i></button></td>',
                '</tr>'
            ].join('');

            var row_html = '';
            var index = 65;
            result.map(function(place, idx) {
                row_html += row_template.replace(/\[INDEX\]/g, String.fromCharCode(index + idx))
                    .replace(/\[NAME\]/, place.name)
                    .replace(/\[LAT\]/, place["location"].lat)
                    .replace(/\[LNG\]/, place["location"].lng);
            });
            list_view.html(html.replace(/\[DATA_ROW\]/, row_html));
            list_view.show();
            // map.setCenter(place["location"].lat, place["location"].lng);
        });
        chk = -1;
        // console.log('hi?');
    };

    $(document).on('click', '.view_position', function() {
        var $this = $(this);
        var marker = new naver.maps.Marker({
            position: new naver.maps.LatLng(new naver.maps.Point($this.data('lng'), $this.data('lat'))),
            map: map,
            icon: 'http://static.naver.net/maps/img/icons/pins_n_' + $this.data('title').toLowerCase() + '.png',
            title: $this.data('title')
        });
        placeMarkerList.map(function(item) {
            item.setMap(null);
        });
        placeMarkerList.push(marker);
    });
}