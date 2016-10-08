
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



var locations = {
	all: '-180,-90,180,90'
}

// attach to filter stream
var tweetStream = twitter.stream('statuses/filter', { locations: locations.all });

// on tweet
tweetStream.on('tweet', function (tweet) {

// check that tweet has geo
if (tweet.geo) {
  //console.log(tweet);
  //console.log(tweet.text);
  fs.appendFile('twitt_data.txt', tweet.geo.coordinates + '\r\n' + tweet.text + '\r\n\r\n', function(err) {
    if (err) {
      console.error("write error: " + error.message);
    } else {
      console.log(tweet);
    }
    })
  };

});
