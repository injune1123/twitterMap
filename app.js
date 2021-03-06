// set up basic node express server
var express = require('express');
var request = require('request');
var app = express();
var nconf = require('nconf');
nconf.file({ file: 'config.json' }).env();
var port =  process.env.PORT || 8081;
var server = require('http').Server(app);
var util = require('./util');
var bodyParser = require('body-parser');
// var server = require('http').createServer(app);
var io = require('socket.io')(server);
var streamingServer = require('./streaming-server');
var worker = require('./worker');

//initialize AWS ES
var Elasticsearch = require('aws-es');

var elasticsearch = new Elasticsearch({
		accessKeyId: nconf.get('ACCESS_KEY_ID'),
		secretAccessKey: nconf.get('SECRECT_ACCESS_KEY'),
		service: nconf.get('SERVICE'),
		region: nconf.get('REGION'),
		host: nconf.get("HOST")
});


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

app.get('/search',function(req,res){ 
  console.log("??????",req.query['search_str']);

  var bodyContent = {
        "size":500,
        "query": {
            "match_all":{}
        }
  };

  if (req.query['search_str']){
    bodyContent = {
        "size":500,
        "query": {
            "match":{
              "tweet_content":req.query['search_str']
            }
        }
      }
  }
  
  elasticsearch.search({
      index: 'tweets',
      type: 'tweets',
      body: bodyContent
    }, function(err, data) {
      if (err){
        console.log("error", err);
      }else{
        console.log(data['hits']['hits']);
        res.send(data['hits']['hits'])
      }
    });  
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
    console.log(hdr)
    if(hdr === 'Notification'){
        // console.log("data!!!!!!!!!!!!!!!!!!!", req.body['Message'], typeof(req.body['Message']));      //Elasticsearch
        console.log("data!!!")
        elasticsearch.index({
                 index: 'tweets',
                 type: 'tweets',
                 body: JSON.parse(req.body['Message'])
               }, function(err, data) {
                if(err){
                  console.log(err)
                  console.log("Index failed")
                }else{
                  //socket.io
                  console.log("Indexed successfully")
                  io.sockets.emit('a new tweet is coming', JSON.parse(req.body['Message'])['tweet_geo_coord']);
                  console.log('new tweet indexed');
                }
            });
    }
    res.send(req.body)
});


app.use(function(req, res, next) {
  res.status(404).send('Sorry. cant find that.');
});


streamingServer.streamingServer();
worker.worker();

