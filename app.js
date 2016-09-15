'use strict';

var express = require('express');
var app = express();
var router = express.Router();
var bodyParser = require('body-parser');
var morgan = require('morgan');

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.set('views', process.cwd() + '/app/views');
app.set('view engine', 'ejs');
app.use(router);

var port = process.env.PORT || 3000;

require('./config/routes')(router);

app.listen(port, function () {
  console.log("Listening on : "+ port);
});