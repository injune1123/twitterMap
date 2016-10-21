// set up basic node express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port =  process.env.PORT || 8081;

server.listen(port, function () {
  console.log('Example app listening on port 8081!');
});

// serve static files, routing
app.use('/static', express.static(__dirname + '/public'));

//initialize twitter
var Twit = require('twit');
var _ = require('lodash');
var fs = require('fs');
var nconf = require('nconf');
nconf.file({ file: 'config.json' }).env();

var twitter = new Twit({
  consumer_key: nconf.get('TWITTER_CONSUMER_KEY'),
  consumer_secret: nconf.get('TWITTER_CONSUMER_SECRET'),
  access_token: nconf.get('TWITTER_ACCESS_TOKEN'),
  access_token_secret: nconf.get('TWITTER_ACCESS_TOKEN_SECRET')
});


//initialize AWS ES
var Elasticsearch = require('aws-es');
var elasticsearch = new Elasticsearch({
		accessKeyId: nconf.get('ACCESS_KEY_ID'),
		secretAccessKey: nconf.get('SECRECT_ACCESS_KEY'),
		service: nconf.get('SERVICE'),
		region: nconf.get('REGION'),
		host: nconf.get("HOST")
});

// set initial area to the globe
var locations = {
	all: '-180,-90,180,90'
}

// difine tweetStrem
var tweetStream = twitter.stream('statuses/filter', { locations: locations.all });


// console.log(tweetStream);


// on tweet
tweetStream.on('tweet', function (tweet) {
  
console.log("trying to seed data")
// check that tweet has geo
if (tweet.geo) {
  // console.log(tweet);
  //console.log(tweet.text);
  io.sockets.emit('a new tweet is coming', tweet.geo.coordinates);

  //index
  elasticsearch.index({
  			index: 'tweets2',
  			type: 'tweets',
  			body: {
  				'tweetGeoCoordinates': tweet.geo.coordinates,
  				'tweetContent': tweet.text
  			}
  		}, function(err, data) {
  			console.log('json reply received');
  });


  // fs.appendFile('twitt_data.txt', '{"tweetGeoCoordinates": ' + ('[' + tweet.geo.coordinates + ']') + ', "tweetContent" :' + ('"' + tweet.text + '"') + '}\r\n\r\n', function(err) {
  //   if (err) {
  //     console.error("write error: " + error.message);
  //   } else {
  //     console.log("tweet:", tweet);
  //   }
  //   })

  };

});



app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get('/about', function (req, res) {
  res.send('Hi, we are a good team!');
});


app.use(function(req, res, next) {
  res.status(404).send('Sorry cant find that!');
});
