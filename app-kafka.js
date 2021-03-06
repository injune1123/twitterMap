var express = require('express');
var request = require('request');
var kafka = require('kafka-node');
var app = express();
var nconf = require('nconf');
nconf.file({ file: 'config.json' }).env();
var port =  process.env.PORT || 8081;
var server = require('http').createServer(app);
var util = require('./util');
var bodyParser = require('body-parser');
// var server = require('http').createServer(app);
var io = require('socket.io')(server);

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
        "size":100,
        "query": {
            "match_all":{}
        }
  };

  if (req.query['search_str']){
    bodyContent = {
        "size":20,
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

Consumer = kafka.Consumer;
consumer = new Consumer(
        new kafka.Client(),
        [
            { topic: 'tweets_with_sentiment_score', partition: 0 }
        ],
        {
            autoCommit: true
        }
    );
consumer.on('message', function (message){
   var msgBody = JSON.parse(message.value);
   console.log("data!!!!!!!!!!!!!!!!!!!", msgBody);      //Elasticsearch
   elasticsearch.index({
                 index: 'tweets',
                 type: 'tweets',
                 body: msgBody
               }, function(err, data) {
                if(err){
                  console.log(err)
                }else{
                  io.sockets.emit('a new tweet is coming', msgBody.tweet_geo_coord);
                 console.log('new tweet indexed');
                }
  });
 });

console.log ('registering subscription routes with express');

app.use(function(req, res, next) {
  res.status(404).send('Sorry. cant find that.');
});