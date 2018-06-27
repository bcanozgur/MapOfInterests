"use strict";

var map;
var sv;
var panorama;

var clickedLat;
var clickedLng;

var clickedMarker;
var poiMarker;

$(document).ready(function () {

    var _mapCenter = [39.970044, 32.714293];
    var _mapZoom = 14;
    var _mapBaseLayer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png');

    map = L.map('map');
    map.addLayer(_mapBaseLayer);
    map.setView(_mapCenter, _mapZoom);

    //document.getElementById("streetViewPanel").style.visibility = "hidden";

    map.on('click', onMapClick);
});

function onMapClick(event) {

    var placesService = new google.maps.places.PlacesService(new google.maps.Map(document.createElement('div')));
    var selectedPoiTypes = [];

    sv = new google.maps.StreetViewService();

    panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'));

    document.getElementById('places').innerHTML = "";

    deleteMarker();

    clickedLat = event.latlng.lat;
    clickedLng = event.latlng.lng;
    clickedMarker = L.marker([clickedLat, clickedLng]);
    clickedMarker.bindPopup("Şu an buradasınız.");
    map.addLayer(clickedMarker);

    $("input:checkbox[name=poiTypes]:checked").each(function () {
        selectedPoiTypes.push($(this).val());
    });

    if (selectedPoiTypes.length > 0) {

        placesService.nearbySearch({
            location: {
                lat: clickedLat,
                lng: clickedLng
            },
            radius: 500,
            types: selectedPoiTypes
        }, placesCallback);

    } else {
        alert("Please select type(s)");
    }

    sv.getPanorama({
        location: event.latlng,         // leaflet event da event.lalng, google event da event.latLng..
        radius: 50
    }, processSVData);

}

function processSVData(data, status) {

    if (status === google.maps.StreetViewStatus.OK) {

        //marker = new google.maps.Marker({
        //    position: data.location.latLng,
        //    map: map,
        //    title: data.location.description
        //});

        panorama.setPano(data.location.pano);
        panorama.setPov({
            heading: 270,
            pitch: 0
        });
        panorama.setVisible(true);

    } else {
        console.error('Street View data not found for this location.');
    }
}


function placesCallback(results, status, pagination) {

    if (status !== google.maps.places.PlacesServiceStatus.OK) {
        alert(status);
    } else {
        createMarkers(results);

        if (pagination.hasNextPage) {
            var moreButton = document.getElementById('moreBtn');

            moreButton.disabled = false;

            moreButton.addEventListener('click', function () {
                moreButton.disabled = true;
                pagination.nextPage();
            });
        }
    }
}

function createMarkers(places) {

    var bounds = new google.maps.LatLngBounds();
    var placesList = document.getElementById('places');
    //var markList = document.getElementById('mark');
    var distance;

    for (var i = 0, place; place = places[i]; i++) {

        var toLat = place.geometry.location.lat();
        var toLng = place.geometry.location.lng();

        var request = {
            origin: { lat: clickedLat, lng: clickedLng },
            destination: { lat: toLat, lng: toLng },
            travelMode: google.maps.DirectionsTravelMode.DRIVING
        };

        myFunction(request, place, function (returnValue, place) {
            distance = returnValue;

            var name = place.name;
            var distanceText = distance + ' m';

            var li = document.createElement("a");
            li.setAttribute("value", distanceText); // for background job
            li.setAttribute("class", "list-group-item");
            li.setAttribute("href", "javascript:;");

            var img = document.createElement("img");
            img.setAttribute("src", place.icon);
            img.setAttribute("height", 35);
            img.setAttribute("style", "padding-right: 10px;");

            var span = document.createElement("span");
            var badgeText = document.createTextNode(distanceText);
            span.appendChild(badgeText);
            span.setAttribute("class", "badge");

            var liText = document.createTextNode(name);

            li.appendChild(img);
            li.appendChild(liText);
            li.appendChild(span);

            li.onclick = function () {
                var poi = new PoiObj();
                poi.lat = place.geometry.location.lat();
                poi.lng = place.geometry.location.lng();
                poi.name = name;
                poi.icon = place.icon;
                poi.distance = distanceText;

                addMarkerToMap(poi);

                $(this).addClass("active").siblings().removeClass("active");
            };

            placesList.appendChild(li);

        });
    }
}

function addMarkerToMap(poi) {

    if (map.hasLayer(poiMarker)) {
        map.removeLayer(poiMarker);
    }
    poiMarker = L.marker([poi.lat, poi.lng], {
        icon: getMarker(poi.icon)
    });

    poiMarker.bindPopup(poi.name + ' ' + poi.distance);
    poiMarker.addTo(map);
}

function myFunction(request, place, callback) {

    var directionsService = new google.maps.DirectionsService();
    directionsService.route(request, function (response, status) {

        if (status == google.maps.DirectionsStatus.OK) {

            var distance = response.routes[0].legs[0].distance.value;
            callback(distance, place);
            //var distTime  = response.routes[0].legs[0].duration.text;
        } else {
            console.log(status);
        }
    });
}

function deleteMarker() {

    if (map.hasLayer(poiMarker)) {
        map.removeLayer(poiMarker);
    }
    if (map.hasLayer(clickedMarker)) {
        map.removeLayer(clickedMarker);
    }



}

function clearMap() {

    deleteMarker();

    $("input:checkbox[name=poiTypes]:checked").each(function () {
        $(this).prop('checked', false);
    });
    document.getElementById('places').innerHTML = "";
    panorama.setVisible(false);

}

function getMarker(url) {
    return L.icon({
        iconUrl: url,
        iconSize: [30, 30]
    });
}