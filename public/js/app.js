//initialize map
var map = undefined;

function initializeMap(){
  map = L.map( 'map', {
      center: [20.0, 5.0],
      minZoom: 2,
      zoom: 2
  });

  L.tileLayer( 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      subdomains: ['a','b','c']
  }).addTo( map );
}

initializeMap();

var circle = undefined;
fetchTweetsInES("");

function filterTweetsWhenKeywordUpdate(){
  var keyword = "";

  var ul = document.getElementById("keyword-list");
  ul.addEventListener('click', function(e){
    if(e.target.tagName === 'A'){
      console.log("circle: ", circle);
      console.log("keyword: ", keyword);

        keyword = e.target.name;
        fetchTweetsInES(keyword);
        console.log("sss", keyword);

    }
  });
}

filterTweetsWhenKeywordUpdate();

// fetch filtered tweets
function fetchTweetsInES( keyWord ) {
  if(circle){
    map.removeLayer(circle);

  }

  var query = {"match_all": {}};
  var queryWithKeyWord = {"match": {"tweetContent": keyWord}};
  if(keyWord !== "" ){
    query = queryWithKeyWord;
  }

  // Send a POST request
  axios({
    method: 'post',
    url: 'https://search-twitter-map-elastic-search-p3rukqk4g4jihaolzvop62ysea.us-east-1.es.amazonaws.com/tweets2/_search',
    data: {
      "size":1000,
      "query": query
    }
  }).then(function(response){
    console.log(response.data.hits.hits);
    response.data.hits.hits.map(function(hit){

        circle = L.circle(hit._source.tweetGeoCoordinates, {
            color: 'blue',
            fillColor: '#f03',
            fillOpacity: 0.5,
            radius: 500
        }).addTo(map);

        setTimeout(function(){
          console.log("trying to remove")
          map.removeLayer(circle)
            // console.log(map);
            // console.log(circle);

         }, 600);

        // setTimeout(function(){
        //   console.log("trying to remove");

        //   map.removeLayer(circle)}, 60000);
    })
  });
  // end of post request
}





//set markers
// var markers = [
//    {
//      "name": "Shanghai",
//      "url": "https://en.wikipedia.org/wiki/Shanghai",
//      "lat": 31.2304,
//      "lng": 121.4737
//    },
//    {
//      "name": "New York",
//      "url": "https://en.wikipedia.org/wiki/New_York",
//      "lat": 40.7128,
//      "lng": -74.0059
//    },
//    {
//      "name": "Oregon",
//      "url": "https://en.wikipedia.org/wiki/Japan",
//      "lat": 43.8041,
//      "lng": -120.5542
//    }
// ];

// for ( var i=0; i < markers.length; ++i )
// {
//    L.marker( [markers[i].lat, markers[i].lng] )
//       .bindPopup( '<a href="' + markers[i].url + '" target="_blank">' + markers[i].name + '</a>' )
//       .addTo( map );
// }





// use socket to display all incoming tweets
var socket = io.connect("http://localhost:8081/");
socket.on("a new tweet is coming", function(data) {
    // Do stuff when we connect to the server
    // console.log("wawawawlallal")
    // console.log(data);

    var circle = L.circle(data, {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: 500
    }).addTo(map);

    setTimeout(function(){
      console.log(circle);
      map.removeLayer(circle)
        // console.log(map);
        // console.log(circle);

     }, 1500);
});
//
//
