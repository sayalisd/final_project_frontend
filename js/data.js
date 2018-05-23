var placesData = [
{
  "name": "Golkonda",
  "location": {"lat" : 17.383309, "lng" : 78.4010528}
},
{
  "name": "Charminar",
  "location": {"lat" : 17.3615636, "lng" : 78.4746645}
},
{
  "name": "Salarjung Museum",
  "location": {"lat" : 17.3713224, "lng" : 78.4803589}
},
{
  "name": "Chowmahalla Palace",
  "location": {"lat" : 17.3578233, "lng" : 78.4716897}
},
{
  "name": "Ramoji Film City",
  "location": {"lat" : 17.254301, "lng" : 78.680767}
}
];

var map,
	bounds,
	wikiurl;
	
// initialize the map
function initMap(){

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: {lat: 17.385044, lng: 78.486671}
    });

    infoWindow = new google.maps.InfoWindow({
    maxWidth: 150,
    content: ""
	});

    bounds = new google.maps.LatLngBounds();

    for(var i=0; i<placesData.length; i++){
        addMarker(placesData[i]);
        bounds.extend(placesData[i].location);
    }
    map.fitBounds(bounds);
}


// this function creates a new marker and adds it to the observableArray of markers
function addMarker(place){
    var coordinates = {
        lat: place.location.lat,
        lng: place.location.lng
    };

    self.marker = new google.maps.Marker({
        map: map,
        position: coordinates,
        animation: google.maps.Animation.DROP,
        clickable: true
    });

    if (self.marker){
        self.markerArray().push([coordinates, self.marker]);
        google.maps.event.addListener(self.marker, "click", function(){
		showWikiInfo(place);
        stopAnimation();
        animateMarker(coordinates);
		});
    }
}


// This function hides all the markers from the map by setting their 'visible' option to false
function hideMarkers(){
  for(var i=0; i<self.markerArray().length; i++){
    self.markerArray()[i][1].setVisible(false);
  }
}

// This function shows all the markers on the map by setting their 'visible' option to true
function displayMarkers(){
  for(var i=0; i<self.markerArray().length; i++){
    self.markerArray()[i][1].setVisible(true);
  }
}


// This function drops the selected marker when the corresponding list item is clicked
function animateMarker(coordinate){
  ko.computed(function(){
    ko.utils.arrayForEach(self.markerArray(), function(marker){
      if(coordinate.lat === marker[0].lat && coordinate.lng === marker[0].lng){
        marker[1].setVisible(true);
        marker[1].setAnimation(google.maps.Animation.DROP);
      }
    });
  });
}

// This function stops the animation of all the markers on the map
function stopAnimation(){
  for(var i=0; i<self.markerArray().length; i++){
    self.markerArray()[i][1].setAnimation(null);
  }
}

// shows the marker that corresponds with the given place
function displayMarkersPlace(place){
  for(var i=0;i<self.markerArray().length; i++){
    if(place.location.lat == self.markerArray()[i][0].lat && place.location.lng == self.markerArray()[i][0].lng){
      self.markerArray()[i][1].setVisible(true);
    }
  }
}


// this function uses the wikipedia api to get url to get info about place and show on sidebar
function showWikiInfo(place){
	var placename = place.name;
	var urlString = "https://en.wikipedia.org/w/api.php?action=opensearch&search="+placename+"&format=json&origin=*";

    $.ajax({
        url: urlString,
        dataType: "json",
        async: true,
        success: function(data){
			wikiurl = data[3][0];
			self.placeInfo(wikiurl);
        },
        error: function(data){
            wikiError();
        }
    });
}


var ViewModel = function(){
    var self = this;

    this.markerArray = ko.observableArray([]);
    this.searchQuery = ko.observable();

    this.placeName = ko.observable();
    this.placeInfo = ko.observable();

    this.apiError = ko.observable(false);
    this.errorMessage = ko.observable();

    // filters locations displayed in the list based on the given search query
    this.searchResult = ko.computed(function(){
        query = self.searchQuery();
        if (!query){
            displayMarkers();
            return placesData;
        } else {
            hideMarkers();
            var filteredPlaces = [];
            for (var i=0; i<placesData.length; i++){
                if (placesData[i].name.toLowerCase().indexOf(query) >= 0){
                    displayMarkersPlace(placesData[i]);
                    filteredPlaces.push(placesData[i]);
                }
            }
            return filteredPlaces;
        }

    });

    // displays the wikipedia info for the given place and animates the corresponding marker on the map
    this.viewPlaceOnMap = function(place){
        var coordinate = {lat: place.location.lat, lng: place.location.lng};
        stopAnimation();
        hideMarkers();
        animateMarker(coordinate);
        showWikiInfo(place);
    };

};


// This function is called when there is an error loading the Google Maps API
function mapError(){
  self.errorMessage("Error in accessing google maps");
  self.apiError(true);
}

// This function is called when there is an error while loading data from the Wikipedia API
function wikiError(){
  self.errorMessage("Error in accessing wikipedia");
  self.apiError(true);
}


// apply bindings
ko.applyBindings(ViewModel());
