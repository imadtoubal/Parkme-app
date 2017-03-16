//Global Variables for the map
var ctrls;
var map;
var globalZoom = 14;
var currentLocationMarker;
var nearParkings = [];
//Loading parkings with JQuery
var markers = new Object();


// if(navigator.geolocation) {
//   navigator.geolocation.getCurrentPosition(function (position){

//   });
// }

// $.getJSON('http://localhost:3000/all', function (data) {
//   markers = data;
//   //for debugging
//   console.log(markers);
// });
var directionsService;
var directionsDisplay;


//Initialize map with markers
function initMap() {
  directionsService = new google.maps.DirectionsService;
  directionsDisplay = new google.maps.DirectionsRenderer({
    suppressMarkers: true,
  });
  //finding current location and creating the map
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      //this code gets executed whenever the browser gets current user location
      //configuring the map controls
      $.getJSON('/near/' + position.coords.latitude + '/' + position.coords.longitude, function (data) {
        markers = data;
        //for debugging
        ctrls = {
          center: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          },
          zoom: globalZoom,
          disableDefaultUI: true,
        };

        //initializing and drawing the map on the document
        configMap(ctrls);

        getParkings();
        directionsDisplay.setMap(map);
        calculateAndDisplayRoute(directionsService, directionsDisplay, nearParkings[0]);
        autoUpdate();
      });
    }, function () {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
    console.log('We could not find you!');
  }


}



//calculate And Display Route
//https://developers.google.com/maps/documentation/javascript/examples/directions-simple
function calculateAndDisplayRoute(directionsService, directionsDisplay, park) {
  directionsService.route({
    origin: currentLocationMarker.position,
    destination: park.position,
    travelMode: google.maps.TravelMode.DRIVING
  }, function (response, status) {
    if (status === google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });
}

//function to configure the map
function configMap(c) {
  map = new google.maps.Map(document.getElementById('map'), c);
  var infoWindow = new google.maps.InfoWindow({ map: map });
  //making a marker showing user location
  currentLocationMarker = new google.maps.Marker({
    position: c.center,
    icon: 'http://localhost:3000/img/iconred.png',
    map: map
  });
}

//function for adding markers
function getParkings() {
  for (var i = 0; i < markers.length; i++) {
    nearParkings.push(new google.maps.Marker({
      position: {
        lat: markers[i].lat,
        lng: markers[i].lng
      },
      icon: 'http://localhost:3000/img/icon.png',
      map: map
    }));
  }
}

//auto update location
function autoUpdate() {
  navigator.geolocation.getCurrentPosition(function (position) {
    var newPoint = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    currentLocationMarker.setPosition(newPoint);
    map.setCenter(newPoint);
  });
  console.log('updated!');
  calculateAndDisplayRoute(directionsService, directionsDisplay, nearParkings[0]);
  setTimeout(autoUpdate, 3000);
}



$('#submit').click(function (e) {
  var lng_ = $('#lng').val();
  var lat_ = $('#lat').val();
  var name_ = $('#name').val();
  var link = 'add/' + lng_ + '/' + lat_ + '/' + name_;
  var myRequest = new XMLHttpRequest();
  myRequest.open("GET", link, false);
  myRequest.send(link);
  alert('Added the parking ' + name_);
  $('#lat').val('');
  $('#lng').val('');
  $('#name').val('');

  e.preventDefault();
});
