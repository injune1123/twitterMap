//initialize map
var map = undefined;

// did not write this code, it's from http://www.movable-type.co.uk/scripts/geohash.html
var geohashBase32 = '0123456789bcdefghjkmnpqrstuvwxyz';

function clearAllDots(){
  var dosArr = document.querySelectorAll("path");
  for(var i = 0; i < dosArr.length; i++){
    dosArr[i].parentNode.removeChild(dosArr[i])
  }
}

var geohashBounds = function(geohash) {
    if (geohash.length === 0) throw new Error('Invalid geohash');

    geohash = geohash.toLowerCase();

    var evenBit = true;
    var latMin =  -90, latMax =  90;
    var lonMin = -180, lonMax = 180;

    for (var i=0; i<geohash.length; i++) {
        var chr = geohash.charAt(i);
        var idx = geohashBase32.indexOf(chr);
        if (idx == -1) throw new Error('Invalid geohash');

        for (var n=4; n>=0; n--) {
            var bitN = idx >> n & 1;
            if (evenBit) {
                // longitude
                var lonMid = (lonMin+lonMax) / 2;
                if (bitN == 1) {
                    lonMin = lonMid;
                } else {
                    lonMax = lonMid;
                }
            } else {
                // latitude
                var latMid = (latMin+latMax) / 2;
                if (bitN == 1) {
                    latMin = latMid;
                } else {
                    latMax = latMid;
                }
            }
            evenBit = !evenBit;
        }
    }

    var bounds = {
        sw: { lat: latMin, lon: lonMin },
        ne: { lat: latMax, lon: lonMax },
    };

    return bounds;
};


var geohashDecode = function(geohash) {

    var bounds = geohashBounds(geohash); // <-- the hard work
    // now just determine the centre of the cell...

    var latMin = bounds.sw.lat, lonMin = bounds.sw.lon;
    var latMax = bounds.ne.lat, lonMax = bounds.ne.lon;

    // cell centre
    var lat = (latMin + latMax)/2;
    var lon = (lonMin + lonMax)/2;

    // round to close to centre without excessive precision: ⌊2-log10(Δ°)⌋ decimal places
    lat = lat.toFixed(Math.floor(2-Math.log(latMax-latMin)/Math.LN10));
    lon = lon.toFixed(Math.floor(2-Math.log(lonMax-lonMin)/Math.LN10));

    return [ Number(lat), Number(lon)];
};



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
  url: 'https://search-twitter-map-elastic-search-p3rukqk4g4jihaolzvop62ysea.us-east-1.es.amazonaws.com/tweets4/_search',
  data: {
    "query": query,
    "size" : 0,
    "aggs" : {
        "geohashAgg" : {
            "geohash_grid" : {
                "field" : "tweet_geo_coord",
                "precision" : 2
            },
            "aggs": {
                "centroid" : {
                    "geo_centroid" : { "field" : "tweet_geo_coord" }
                }
            }
        }
    }
}
}).then(function(response){
  console.log("aggregated data!");
  console.log(response.data.aggregations.geohashAgg.buckets);

response.data.aggregations.geohashAgg.buckets.map(function(aggObj){
  var goeHash = aggObj.key;
  var numOfTweets = aggObj.doc_count
//
  console.log("centroid", aggObj.centroid.location)


var circle = L.circleMarker(L.latLng({"lat":aggObj.centroid.location.lat,"lon":aggObj.centroid.location.lon}), {
  radius: Math.sqrt(numOfTweets)/2,
  stroke: false,
  color: 'red',
  fillColor: '#FFff00',
  fillOpacity: 0.5,
}).addTo(map);
})
});
  axios({
    method: 'post',
    url: 'https://search-twitter-map-elastic-search-p3rukqk4g4jihaolzvop62ysea.us-east-1.es.amazonaws.com/tweets4/_search',
    data: {
      "size":1000,
      "query": query
    }
  }).then(function(response){
    // console.log(response.data.hits.hits);
    response.data.hits.hits.map(function(hit){
      console.log("add new dots")

        circle = L.circle(hit._source.tweet_geo_coord.reverse(), {
            color: 'blue',
            fillColor: '#f03',
            fillOpacity: 0.5,
            radius: 500
        })
        circle.addTo(map);
    })
  })
}

// use socket to display all incoming tweets
var socket = io.connect("http://twittermap-env.us-east-1.elasticbeanstalk.com/");
socket.on("a new tweet is coming", function(data) {
    // Do stuff when we connect to the server
    var circle = L.circle(data, {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: 500
    }).addTo(map);

    setTimeout(function(){
      // console.log(circle);
      map.removeLayer(circle)
     }, 1500);
});
//
//
