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
	  api_key: '58628cf8fcb60ffb107cd339d87265e46ba7a3c4'
	});



	var params = {
	  text: msgBody.text
	};

	alchemy_language.sentiment(params, function (err, response) {
	  if (err)
	    console.log('>_<~**************error:', err);
	  else
	    console.log(">_<~**************",JSON.stringify(response, null, 2));

		var tweetMessage = {
			'tweet': msgBody.text,
			'tweetSentiment' : response,
			'tweetGeoLocation': msgBody.geo
		};

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

workerApp.start();
