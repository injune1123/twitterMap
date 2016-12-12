var nconf = require('nconf');
nconf.file({ file: 'config.json' }).env();
var kafka = require('kafka-node');
Consumer = kafka.Consumer;
Producer = kafka.Producer;
producer = new Producer(new kafka.Client());
consumer = new Consumer(
        new kafka.Client(),
        [
            { topic: 'rawtweets', partition: 0 }
        ],
        {
            autoCommit: true
        }
    );

consumer.on('message', function (message){
    var AlchemyLanguageV1 = require('watson-developer-cloud/alchemy-language/v1');
	var msgBody = JSON.parse(message.value);
	var alchemy_language = new AlchemyLanguageV1({
	  api_key: nconf.get("ALCHEMY_API_KEY")
	});
	params = {
		text:msgBody.text
	}
	console.log(params)
	console.log("===================")
	alchemy_language.sentiment(params, function (err, response) {
	  if (err){
	    console.log('>_<~**************error:', err);
	  }
	  else{
		var sentimentScore = undefined;
		var sentimentType = undefined;
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
		};
	}

	var tweetMessageText = JSON.stringify(tweetMessage, null, 2);
	payloads = [
        { topic: 'tweetswithsentimentscore', messages: tweetMessageText, partition: 0 }
    ];
    producer.send(payloads, function (err, data) {
			console.log("tweetswithsentimentscore", payloads);
		});
});
});