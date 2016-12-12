var nconf = require('nconf');
nconf.file({ file: 'config.json' }).env();
var kafka = require('kafka-node');
Producer = kafka.Producer;
client = new kafka.Client();
producer = new Producer(client);
var Twit = require('twit');

var fs = require('fs');
var nconf = require('nconf');
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

var tweetStream = twitter.stream('statuses/filter', { locations: locations.all, language: 'en' });


tweetStream.on('tweet', function (tweet) {
  data = JSON.stringify(tweet);
  payloads = [
        { topic: 'rawtweets', messages: data, partition: 0 }
    ];
  if (tweet.geo) {
		producer.send(payloads, function (err, data) {
			console.log("KAFKA MESSAGE", data);
		});
    }
});