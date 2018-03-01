var https = require('https');
var google_api_key = 'AIzaSyCIt4-iVonE3ZpvcAg8WPE9OVs4SBuHWiM';
exports.get_center = function(request, callback) {
    var markerListX = request.markerJsonListX;
    var markerListY = request.markerJsonListY;
    var latitude = 0,
        longitude = 0;
    var len = markerListX.length;
    for (var i = 0; i < len; i++) {
        longitude += Number(markerListX[i]);
        latitude += Number(markerListY[i]);
    }
    longitude /= len;
    latitude /= len;
    callback({ "lat": latitude, "lng": longitude });
};

exports.search_place = function(options, callback) {
    var center = options.center;
    var type = options.type;
    var radius_arr = [50, 100, 200, 300, 500, 1000];
    var radius_idx = 0;
    // console.log(options);
    var loop = function(inner_callback) {
        var radius = radius_arr[radius_idx];
        var request_options = {
            host: 'maps.googleapis.com',
            port: 443,
            path: '/maps/api/place/nearbysearch/json?location=' + center.lat + ',' + center.lng + '&radius=' + radius + '&type=' + type + '&key=' + google_api_key,
            method: 'GET'
        };
        var result;
        var request = https.request(request_options, function(res) {
            res.on('data', function(data) {
                result += data.toString();
                // console.log(result);
            });
            res.on('end', function() {
                result = result ? JSON.parse(result.replace(/undefined/g, '')) : null;
                if (!result || !result.results || !result.results.length) {
                    return inner_callback('not found');
                } else {
                    return inner_callback(null, result.results);
                }
            });
        });
        // console.log(result);

        request.on('error', function(e) {
            console.log('Google API error: ', e.message);
        });
        request.end();
    };
    var inner_cb = function(err, res) {
        if (err && radius_idx < radius_arr.length - 1) {
            radius_idx++;
            loop(inner_cb);
        } else if (err && radius_idx == radius_arr.length - 1) {
            callback(null);
        } else {
            res = res.map(function(item) {
                return {
                    'location': item.geometry["location"],
                    'name': item.name,
                    'rating': item.rating ? parseInt(item.rating, 10) : 0
                };
            });
            res.sort(function(a, b) {
                if (a.rating && b.rating) {
                    if (a.rating < b.rating) {
                        return 1;
                    } else if (a.rating > b.rating) {
                        return -1;
                    } else {
                        return 0;
                    }
                } else {
                    if (a.rating) {
                        return -1;
                    } else if (b.rating) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            });
            // console.log(res);
            callback(res);
        }
    }

    loop(inner_cb);
};