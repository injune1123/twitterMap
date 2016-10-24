//initialize map
var map;
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 20, lng: 5},
    zoom: 2
  });
}

var singleTweetCircleArr = [];

var geohashDecode = (function(){
  // did not write this code, it's from http://www.movable-type.co.uk/scripts/geohash.html
  var geohashBase32 = '0123456789bcdefghjkmnpqrstuvwxyz';

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


  var tem =  function(geohash) {

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

      return {"lat": Number(lat), "lng": Number(lon)};
  };

  return tem;

})()

// use socket to display all incoming tweets
var socket = io.connect("http://localhost:8081/");
socket.on("a new tweet is coming", function(data) {
    // Do stuff when we connect to the server
    // e.g. data = [-68, 23]
    var circle = new google.maps.Circle({
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0.35,
      map: map,
      center: {"lat": data[0], "lng": data[1]},
      radius: 50000
    });


    setTimeout(function(){
      // console.log(circle);
      circle.setMap(null);
     }, 1500);

});
//
console.log(geohashDecode("h"));

//
axios({
  method: 'post',
  url: 'https://search-twitter-map-elastic-search-p3rukqk4g4jihaolzvop62ysea.us-east-1.es.amazonaws.com/tweets3/_search',
  data: {
    "query": {
        "match_all": {}
    },
    "size" : 0,
    "aggs" : {
        "geohashAgg" : {
            "geohash_grid" : {
                "field" : "tweet_geo_coord",
                "precision" : 1
            }
        }
    }
  }
}).then(function(response){
  console.log("aggregated data!");
  console.log(response.data.aggregations.geohashAgg.buckets);

response.data.aggregations.geohashAgg.buckets.map(function(aggObj){
  var goeHash = aggObj.key

console.log("goeHash", geohashDecode(goeHash))
console.log(aggObj["doc_count"])

    var countCircle = new google.maps.Circle({
      strokeColor: 'blue',
      strokeOpacity: 0.8,
      strokeWeight: 0.2,
      fillColor: 'blue',
      fillOpacity: 0.35,
      map: map,
      center: geohashDecode(goeHash),
      radius: 1000000,
    });

    console.log(countCircle)
// L.marker( geohashDecode(goeHash) )
//            .bindPopup( "" + aggObj["doc_count"] )
//            .addTo( map );

// var circle = L.circle(geohashDecode(goeHash), {
//     color: 'red',
//     fillColor: '#f03',
//     fillOpacity: 0.5,
//     radius: 500000
// }).addTo(map);

})

})




// fetchTweetsInES("");
//
function filterTweetsWhenKeywordUpdate(){
  var keyword = "";



  var ul = document.getElementById("keyword-list");
  ul.addEventListener('click', function(e){
    if(e.target.tagName === 'A'){
      console.log("keyword: ", keyword);
      console.log("dfadsfa", singleTweetCircleArr);


      for (var i = 0; i <singleTweetCircleArr.length ; i++){
        console.log("dsafdsfasdfdsa213012930-219",singleTweetCircleArr[0] )
        singleTweetCircleArr[0].setMap(null);

      }

      console.log("whattttt", singleTweetCircleArr);

      keyword = e.target.name;
      fetchTweetsInES(keyword);
    }
  });
}

filterTweetsWhenKeywordUpdate();

// fetch filtered tweets
function fetchTweetsInES( keyWord ) {

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
      "size":1000,
      "query": query
    }
  }).then(function(response){
    // console.log(response.data.hits.hits);


    console.log("response ya", response)
    response.data.hits.hits.map(function(hit){

      var groDataArr =  hit._source.tweet_geo_coord;
      var singleTweetCircle = new google.maps.Circle({
        strokeColor: 'blue',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: 'blue',
        fillOpacity: 0.35,
        map: map,
        center: {"lat": groDataArr[0], "lng": groDataArr[1]},
        radius: 50000
      });

      singleTweetCircleArr.push(singleTweetCircle);
    })

  });
}
