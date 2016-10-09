var express = require('express');
var app = express();

app.use('/static', express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get('/about', function (req, res) {
  res.send('Hi, we are a good team!');
});

app.listen(8081, function () {
  console.log('Example app listening on port 3000!');
});

app.use(function(req, res, next) {
  res.status(404).send('Sorry cant find that!');
});
