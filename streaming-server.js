//initialize twitter
var Twit = require('twit');

// var express = require('express');
// var app = express();
// var server = require('http').createServer(app);
// var io = require('socket.io')(server);


// var _ = require('lodash');
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
// var Elasticsearch = require('aws-es');
// var elasticsearch = new Elasticsearch({
// 		accessKeyId: nconf.get('ACCESS_KEY_ID'),
// 		secretAccessKey: nconf.get('SECRECT_ACCESS_KEY'),
// 		service: nconf.get('SERVICE'),
// 		region: nconf.get('REGION'),
// 		host: nconf.get("HOST")
// });


//initialize SQS
var AWS = require('aws-sdk');
AWS.config.update({accessKeyId: nconf.get('ACCESS_KEY_ID'), secretAccessKey: nconf.get('SECRECT_ACCESS_KEY')});
var sqs = new AWS.SQS({region:nconf.get('REGION')}); 

//====================================================================
//streaming tweets 
//filter by (geolocation) and language (English)
//send message to SQS for asynchronous processing on the text of the tweet
//===================================================================

// set initial area to the globe
var locations = {
	all: '-180,-90,180,90'
}

// difine tweetStrem
var tweetStream = twitter.stream('statuses/filter', { locations: locations.all, language: 'en' });


// // on tweet

var streamingServer = function (){


// Pumping messages into the AWS SQS: Amazon Simple Message Queue Service
tweetStream.on('tweet', function (tweet) {
//
// console.log("trying to seed data")
// // check that tweet has geo
  if (tweet.geo) {
    // console.log(tweet.text);
    // got some help from the blog : http://clarkie.io/nodejs/2015/03/05/sqs-with-nodejs.html 
    var sqsParams = {
      MessageBody: JSON.stringify(tweet),
      QueueUrl: nconf.get('AWS_SQS_URL'),
    };

    sqs.sendMessage(sqsParams, function(err, data) {
      if (err) {
        console.log('ERR', err);
      }

      console.log("SQS MESSAGE", data);
    })
  }
});


}


module.exports = {

streamingServer: streamingServer
}

  // fs.appendFile('twitt_data.txt', tweet.lang + '\r\n' + tweet.geo.coordinates + '\r\n' + tweet.text + '\r\n\r\n', function(err) {
  //     if (err) {
  //       // console.error("write error: " + error.message);
  //     } else {
  //       // console.log(tweet);
  //     }
  // })


// send message to SQS


// io.sockets.emit('a new tweet is coming', tweet.geo.coordinates);
//   //   //index
// elasticsearch.index({
//     			index: 'tweets4',
//     			type: 'tweets',
//     			body: {
//     				'tweet_geo_coord': tweet.geo.coordinates.reverse(),
//     				'tweet_content': tweet.text
//     			}
//     		}, function(err, data) {
//     			console.log('new tweet indexed');
//     });
//   }
// });