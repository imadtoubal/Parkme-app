
//Global Variables for the map
var ctrls;
var map;
var globalZoom = 14;
var currentLocationMarker;
var nearParkings = [];
//Loading parkings with JQuery
var markers = new Object();
var iw;
var selectedParking;
var pin;
var isTracking = false;
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
window.initMap = function () {
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
          styles: [{ featureType: "all", elementType: "labels.text.fill", stylers: [{ color: "#ffffff" }] }, { featureType: "all", elementType: "labels.text.stroke", stylers: [{ color: "#000000" }, { lightness: 13 }] }, { featureType: "administrative", elementType: "geometry.fill", stylers: [{ color: "#000000" }] }, { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#144b53" }, { lightness: 14 }, { weight: 1.4 }] }, { featureType: "landscape", elementType: "all", stylers: [{ color: "#08304b" }] }, { featureType: "poi", elementType: "geometry", stylers: [{ color: "#0c4152" }, { lightness: 5 }] }, { featureType: "road.highway", elementType: "geometry.fill", stylers: [{ color: "#000000" }] }, { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#0b434f" }, { lightness: 25 }] }, { featureType: "road.arterial", elementType: "geometry.fill", stylers: [{ color: "#000000" }] }, { featureType: "road.arterial", elementType: "geometry.stroke", stylers: [{ color: "#0b3d51" }, { lightness: 16 }] }, { featureType: "road.local", elementType: "geometry", stylers: [{ color: "#000000" }] }, { featureType: "transit", elementType: "all", stylers: [{ color: "#146474" }] }, { featureType: "water", elementType: "all", stylers: [{ color: "#021019" }] }]

        };

        //initializing and drawing the map on the document
        configMap(ctrls);

        getParkings();
        directionsDisplay.setMap(map);
        iw = new google.maps.InfoWindow();
        console.log(nearParkings);
        // google.maps.event.addListener(nearParkings, 'click', function () {
        //   iw.setContent(this.html);
        //   iw.open(map, this);
        // });
        for (var i = 0; i < nearParkings.length; i++) {
          nearParkings[i].addListener('click', function () {
            iw.setContent(this.html);
            iw.open(map, this);
            selectedParking = this;
            isTracking = true;
            calculateAndDisplayRoute(directionsService, directionsDisplay, selectedParking);

            $('.parking').click(function () {
              var id = Number($('.parking').attr('id').substring(1));
              //TODO: get json 
              $.getJSON('http://localhost:3000/getpin/' + id, function (data) {
                var time = 1200;
                pin = data.pin;
                pinElement = $('#pin');
                //for debugging
                console.log(pin);
                setInterval(autoUpdate, 10000);
                $('.parking').after('<h4>PIN: ' + pin + '<h4>');
                $('.parking').hide();
                pinElement.html('<b>PIN: </b>' + pin + ' - ' + n(Math.floor(time / 60)) + ':' + n(time % 60));
                pinElement.removeClass('hidepin');
                setInterval(function () {
                  if (time > 0) {
                    time--;
                    pinElement.html('<b>PIN: </b>' + pin + ' - ' + n(Math.floor(time / 60)) + ':' + n(time % 60));
                  }
                  else {
                    pinElement.html('<b>Expired</b>');
                    clearInterval();
                    //stays one more second and displays expired.
                    setTimeout(function () {
                      pinElement.addClass('hidepin');
                    }, 1000);
                  }
                }, 1000);

              });
            });
          });

        }

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
  //var infoWindow = new google.maps.InfoWindow({ map: map });
  //making a marker showing user location
  currentLocationMarker = new google.maps.Marker({
    position: c.center,
    icon: './img/iconred.png',
    map: map
  });
}

//function for adding markers
function getParkings() {
  for (var i = 0; i < markers.length; i++) {
    if (markers[i].a_lots != 0)
      nearParkings.push(new google.maps.Marker({
        position: {
          lat: markers[i].lat,
          lng: markers[i].lng
        },
        icon: './img/icon.png',
        map: map,
        title: markers[i].name,
        html: '<h1>' + markers[i].name + '</h1> <p>' + markers[i].description + '</p>' +
        '<p style="color: green">Price: <b>' + markers[i].price + ' DZA / H</b> </p>' +
        '<button class="parking" id="p' + markers[i].id + '">reserve</button>'
      }));
    console.log(markers[i].description);
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
  if (selectedParking) {
    calculateAndDisplayRoute(directionsService, directionsDisplay, selectedParking);

  }
  //TO DO: update only while driving
  //if(isTracking)  setTimeout(autoUpdate, 3000);
}

$('.accordion').accordion({
  collapsible: true,
  animate: 200,
  active: 1
});

$(document).ready(function () {

  $('#submit').click(function (e) {
    var lng_ = $('#lng').val();
    var lat_ = $('#lat').val();
    var name_ = $('#name').val();
    var description_ = $('#desctiption').val();
    var a_lots_ = $('#a_lots').val();
    var t_lots_ = $('#t_lots').val();
    var link = 'add/lqAna7NllTTuK0nVRaro/' + lng_ + '/' + lat_ + '/' + name_ + '/' + description_ + '/' + a_lots_ + '/' + t_lots_;
    var myRequest = new XMLHttpRequest();
    myRequest.open("GET", link, false);
    myRequest.send(link);
    alert('Added the parking ' + name_);
    $('#lat').val('');
    $('#lng').val('');
    $('#name').val('');
    $('#a_lots').val('');
    $('#t_lots').val('');
    $('#description').val('');

    e.preventDefault();
  });

  $('#menu').click(function () {
    console.log('clicked!');
    $('#side').toggleClass('hide');
  });

});



function n(n) {
  return n > 9 ? "" + n : "0" + n;
}


