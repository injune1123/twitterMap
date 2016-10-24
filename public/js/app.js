//initialize map
var map = undefined;
// var markers = [];
// var markersLayer = new L.LayerGroup();

// did not write this code, it's from http://www.movable-type.co.uk/scripts/geohash.html
var geohashBase32 = '0123456789bcdefghjkmnpqrstuvwxyz';

function clearAllDots(){
  var dosArr = document.querySelectorAll("path");
  for(var i = 0; i < dosArr.length; i++){
    dosArr[i].parentNode.removeChild(dosArr[i])
  }
}

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
  clearAllDots();

  var query = {"match_all": {}};
  var queryWithKeyWord = {"match": {"tweet_content": keyWord}};
  if(keyWord !== "" ){
    query = queryWithKeyWord;
  }

  // Send a POST request
  axios({
    method: 'post',
    url: 'https://search-twitter-map-elastic-search-p3rukqk4g4jihaolzvop62ysea.us-east-1.es.amazonaws.com/tweets3/_search',
    data: {
      "size":3000,
      "query": query
    }
  }).then(function(response){
    // console.log(response.data.hits.hits);
    response.data.hits.hits.map(function(hit){
      console.log("add new dots")

        circle = L.circle(hit._source.tweet_geo_coord, {
            color: 'blue',
            fillColor: '#f03',
            fillOpacity: 0.5,
            radius: 500
        })
        circle.addTo(map);
    })
  });
  // end of post request
}

// use socket to display all incoming tweets
var socket = io.connect("http://localhost:8081/");
socket.on("a new tweet is coming", function(data) {
    // Do stuff when we connect to the server
    var circle = L.circle(data, {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: 500
    }).addTo(map);

    setTimeout(function(){
      map.removeLayer(circle)
     }, 1500);
});
