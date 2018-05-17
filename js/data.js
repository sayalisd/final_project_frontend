var places = [
{
  "name": "Golkonda Fort",
  "location": {"lat" : 17.383309, "lng" : 78.4010528},
},
{
  "name": "Charminar",
  "location": {"lat" : 17.3615636, "lng" : 78.4746645},
},
{
  "name": "Salarjung Museum",
  "location": {"lat" : 17.3713224, "lng" : 78.4803589},
},
{
  "name": "Chowmahalla Palace",
  "location": {"lat" : 17.3578233, "lng" : 78.4716897},
},
{
  "name": "Ramoji Film City",
  "location": {"lat" : 17.254301, "lng" : 78.680767},
}
]

// Create global variables
var map,
	infowindow,
	bounds;
var $wikiElem = $('#wikipedia-links');

//initMap() is called when page is loaded
function initMap() {
  map = new google.maps.Map(document.getElementById("map"),{center: {lat: 17.385044, lng: 78.486671},zoom: 13,mapTypeControl: false});
  infowindow = new google.maps.InfoWindow();
  bounds = new google.maps.LatLngBounds();

  // Close infowindow when clicked elsewhere on the map
  map.addListener("click", function(){
    infowindow.close(infowindow);
  });
  
  // Recenter map upon window resize
  window.onresize = function () {
    map.fitBounds(bounds);
  };

  //Creating Place object
  var Place = function (data, id, map) {
    var self = this;
    this.name = ko.observable(data.name);
    this.location = data.location;
    this.marker = "";
    this.markerId = id;
  };
  
  function getContent(place) {
	var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search='+place.name+'&format=json&origin=*';	
    var contentString = place.wikiUrl
    var errorString = "Wikipedia not working"
    if (place.name.length > 0) {
      return contentString;
      } else {
      return errorString;
      }
  }
  
 function ViewModel() {
    var self = this;

    // Nav button control
    this.isNavClosed = ko.observable(false);
    this.navClick = function () {this.isNavClosed(!this.isNavClosed());};

    // Creating list elements from the placeList
    this.placeList = ko.observableArray();
    places.forEach(function(item){self.placeList.push(new Place(item));});

    // Create a marker per place item
    this.placeList().forEach(function(place) {
      var marker = new google.maps.Marker({
        map: map,
        position: place.location,
        animation: google.maps.Animation.DROP
      });
      place.marker = marker;	  
	  bounds.extend(marker.position);
	  
      // Create an onclick event to open an infowindow and bounce the marker at each marker
      marker.addListener("click", function(e) {
        map.panTo(this.position);
        map.panBy(0, -200);
		infowindow.setContent(getContent(place));
        infowindow.open(map, marker);
    });
  });

  
    // Creating click for the list item
    this.itemClick = function (place) {
      var markerId = place.markerId;
      google.maps.event.trigger(place.marker, "click");
    }

    // Filtering the Place list
    self.filter = ko.observable("");

    this.filteredPlaceList = ko.dependentObservable(function() {
      var q = this.filter().toLowerCase();
      if (!q) {
      // Returns the original array;
      return ko.utils.arrayFilter(self.placeList(), function(item) {
        item.marker.setVisible(true);
        return true;
      });
      } else {
		  return ko.utils.arrayFilter(this.placeList(), function(item) {
          if (q.toLowerCase().indexOf(q) >= 0) {
          return true;
          } else {
            item.marker.setVisible(false);
          return false;
          }
        });
      }
    }, this);
  };

 // Activates knockout.js
ko.applyBindings(new ViewModel());
}