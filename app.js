// set up basic node express server
var express = require('express');
var app = express();
var port =  process.env.PORT || 8081;

server.listen(port, function () {
  console.log('Example app listening on port 8081!');
});

// serve static files, routing
app.use('/static', express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get('/about', function (req, res) {
  res.send('Hi, we are a good team!');
});

app.use(function(req, res, next) {
  res.status(404).send('Sorry cant find that!');
});
