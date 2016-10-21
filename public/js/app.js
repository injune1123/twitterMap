//initialize map
var map = undefined;
var markers = [];
// var markersLayer = new L.LayerGroup();

// console.log("markersLayer", markersLayer);

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
      console.log("keyword: ", keyword);

      keyword = e.target.name;
      fetchTweetsInES(keyword);
    }
  });
}

filterTweetsWhenKeywordUpdate();

// fetch filtered tweets
function fetchTweetsInES( keyWord ) {
      // markers= [];
      // // markersLayer =  L.LayerGroup(markers);
      //
      // console.log('markers', markers)
      // console.log('num of markers', markers.length)
      //
      // console.log('markersLayer: ',markersLayer.getLayers());

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
    // console.log(response.data.hits.hits);
    response.data.hits.hits.map(function(hit){

        circle = L.circle(hit._source.tweetGeoCoordinates, {
            color: 'blue',
            fillColor: '#f03',
            fillOpacity: 0.5,
            radius: 500
        })

        circle.addTo(map);

        // markers.push(circle);
        // markersLayer.addLayer(markers);
        // console.log("circle", circle);
    })
    //
    // console.log('markers', markers)
    // console.log('num of markers', markers.length)
    // console.log('markersLayer', markersLayer)
  });
  // end of post request
}

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
     }, 1500);
});
//
//
