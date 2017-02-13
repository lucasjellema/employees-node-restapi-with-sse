var express = require('express')
  , http = require('http');
  
var fs = require('fs');
// not available locally, only on ACCS 
var oracledb = require('oracledb');
var bodyParser = require('body-parser') // npm install body-parser
var utils = require( "./proxy-utils.js" );
var employeesAPI = require( "./employees-api.js" );

var app = express();
var server = http.createServer(app);
//var io = require('socket.io').listen(server);

var PORT = process.env.PORT || 3000;
var APP_VERSION = '0.0.4.06';

//CORS middleware - taken from http://stackoverflow.com/questions/7067966/how-to-allow-cors-in-express-node-js
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Credentials', true); 
    next();
}

server.listen(PORT, function () {
  console.log('Server running, version '+APP_VERSION+', Express is listening... at '+PORT+" for Employees Data API");
});

app.use(bodyParser.json()); // for parsing application/json
app.use(allowCrossDomain);


app.use(express.static(__dirname + '/public'))
app.get('/about', function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write("Version "+APP_VERSION+". No Data Requested, so none is returned; try /departments or /sessions or something else");
    res.write("Supported URLs:");
    res.write("/employee-api/employees , /employee-api/employees/id ");
    res.write("incoming headers" + JSON.stringify(req.headers)); 
    res.end();
});

employeesAPI.registerListeners(app);

