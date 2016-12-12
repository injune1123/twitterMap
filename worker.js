// define worker pool to pick up messages from AWS SQS
var nconf = require('nconf');
nconf.file({ file: 'config.json' }).env();

var Consumer = require('sqs-consumer');
//initialize SNS
// learned from https://gist.github.com/tmarshall/6149ed2475f964cda3f5
var AWS = require('aws-sdk');
AWS.config.update(
	{accessKeyId: nconf.get('ACCESS_KEY_ID'), 
	secretAccessKey: nconf.get('SECRECT_ACCESS_KEY'),
	region:nconf.get('REGION')
});
var sns = new AWS.SNS(); 

var workerApp = Consumer.create({
  queueUrl: nconf.get('AWS_SQS_URL'),
  region: nconf.get('REGION'),
  batchSize: 10,
  handleMessage: function (message, done) {

    var msgBody = JSON.parse(message.Body);
    console.log("~ -(0_<)/ ~",msgBody);


    var AlchemyLanguageV1 = require('watson-developer-cloud/alchemy-language/v1');

	var alchemy_language = new AlchemyLanguageV1({
	  api_key: nconf.get("ALCHEMY_API_KEY")
	});



	var params = {
	  text: msgBody.text
	};

	alchemy_language.sentiment(params, function (err, response) {
		var sentimentScore = undefined;
		var sentimentType = undefined;
		if (err){
			console.log('>_<~**************error:', err);
			var tweetMessage = {
			'tweet_content': msgBody.text,
			'tweet_geo_coord': msgBody.geo.coordinates,
			'sentiment_score' : sentimentScore,
			'sentiment_type' : sentimentType,
		}
		}
		else{  
			console.log(">_<~**************",JSON.stringify(response, null, 2));
			if(response.status === 'OK'){
				var docSentiment = response.docSentiment;
				sentimentScore = parseFloat(docSentiment.score);
				sentimentType = docSentiment.type;
			}

			var tweetMessage = {
				'tweet_content': msgBody.text,
				'tweet_geo_coord': msgBody.geo.coordinates,
				'sentiment_score' : sentimentScore,
				'sentiment_type' : sentimentType,
			}
		}
		console.log("=0= ^^^^^~&********)(*)*(*)",tweetMessage)


//http://stackoverflow.com/questions/31484868/can-you-publish-a-message-to-an-sns-topic-using-an-aws-lambda-function-backed-by

 var tweetMessageText = JSON.stringify(tweetMessage, null, 2);
    console.log("Received event:", tweetMessageText);

    var params = {
        Message: tweetMessageText, 
        Subject: "twitterMapTopic",
        TopicArn: "arn:aws:sns:us-east-1:236141017744:twitterMapTopic"
    };
    sns.publish(params, done);
	});


	return;

    // return done();

  }
});

workerApp.on('error', function (err) {
  console.log(err);
});

var worker = function(){
	workerApp.start();
}

module.exports = {
	worker: worker
}
