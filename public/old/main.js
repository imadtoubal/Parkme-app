var map;
var boudouaou = {lat: 36.748, lng: 3.4398};


//Loading markers with JQuery
var markers;
$.getJSON('http://localhost:3000/all', function(data){
  markers = data;
});

//Initla location of the map
var ctrls = {
  center: boudouaou,
  zoom: 14,
  disableDefaultUI: true,
};


//Initialize map with markers
function initMap() {
  //Appending the map
  map = new google.maps.Map(document.getElementById('map'), ctrls);
  
  //Adding markers
  for (var i = 0; i < markers.length; i++) {
    var marker = new google.maps.Marker({
      'position': markers[i].position,
      map: map
    })
  }
}

$('#submit').click(function(e){
  var lng = $('#lng').val();
  var lat = $('#lat').val();
  var name = $('#name').val();
  console.log(lng);
  var link = 'add/' + lng + '/'+ lat + '/'+  name;
  var myRequest = new XMLHttpRequest();
  myRequest.open("GET", link, false);
  myRequest.send(null);

  e.preventDefault();
});