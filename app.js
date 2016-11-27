// set up basic node express server
var express = require('express');
var request = require('request');
var app = express();
var port =  process.env.PORT || 8081;
var server = require('http').createServer(app);
var util = require('./util');
var bodyParser = require('body-parser');


server.listen(port, function () {
  console.log('Example app listening on port 8081!');
});

// serve static files, routing
app.use('/static', express.static(__dirname + '/public'));
app.use(util.overrideContentType());
app.use(bodyParser());
// app.use(bodyParser.urlencoded({extended: false}));


app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get('/about', function (req, res) {
  res.send('Hi, we are a good team!');
});

console.log ('registering subscription routes with express');
app.post('/notification',function(req, res) {
	hdr = req.headers['x-amz-sns-message-type']
    if(hdr === 'SubscriptionConfirmation' && req.body.hasOwnProperty('SubscribeURL')){
    	request(req.body['SubscribeURL'], function (error, response, body) {
    		if (!error && response.statusCode == 200) {
    		console.log(body) // Print the google web page.
    	}
    })
    }
    if(hdr === 'Notification'){
    	cleaned_msg = JSON.parse(req.body['Message']);

        console.log("tweets!!!!!!!!!!!!!!!!!!!", cleaned_msg['tweet']);
        console.log("tweetSentiment!!!!!!!!!!!!", cleaned_msg['tweetSentiment']);
        console.log("tweetGeoLocation!!!!!!!!", cleaned_msg['tweetGeoLocation']);

        //Elasticsearch

        //socket.io
    }
    res.send(req.body)
});


app.use(function(req, res, next) {
  res.status(404).send('Sorry. cant find that.');
});


// reference to https://www.ibm.com/developerworks/library/wa-notify-app/



// app.get('/subscriptions', sub.findAll);
// app.get('/subscriptions/:id', sub.findById);
// app.put('/subscriptions/:id', sub.updateSubscription);
// app.delete('/subscriptions/:id', sub.deleteSubscription);
// //An API to signal an event:
// app.post('/signals', signal.processSignal);
// //An API to retrieve a log of recent signals:
// app.get('/signallog', signallog.findRecent);