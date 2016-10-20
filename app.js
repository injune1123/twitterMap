var express = require('express');
var app = express();
//
var Elasticsearch = require('aws-es');

var nconf = require('nconf');
var Twit = require('twit');
var _ = require('lodash');
var fs = require('fs');

nconf.file({ file: 'config.json' }).env();

var twitter = new Twit({
  consumer_key: nconf.get('TWITTER_CONSUMER_KEY'),
  consumer_secret: nconf.get('TWITTER_CONSUMER_SECRET'),
  access_token: nconf.get('TWITTER_ACCESS_TOKEN'),
  access_token_secret: nconf.get('TWITTER_ACCESS_TOKEN_SECRET')
});

//initialization
var elasticsearch = new Elasticsearch({
		accessKeyId: nconf.get('ACCESS_KEY_ID'),
		secretAccessKey: nconf.get('SECRECT_ACCESS_KEY'),
		service: nconf.get('SERVICE'),
		region: nconf.get('REGION'),
		host: nconf.get("HOST")
});


var locations = {
	all: '-180,-90,180,90'
}

// attach to filter stream
var tweetStream = twitter.stream('statuses/filter', { locations: locations.all });

// on tweet
tweetStream.on('tweet', function (tweet) {

// check that tweet has geo
if (tweet.geo) {
  // console.log(tweet);
  //console.log(tweet.text);

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


app.use('/static', express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get('/about', function (req, res) {
  res.send('Hi, we are a good team!');
});

app.listen(8081, function () {
  console.log('Example app listening on port 3000!');
});

app.use(function(req, res, next) {
  res.status(404).send('Sorry cant find that!');
});
