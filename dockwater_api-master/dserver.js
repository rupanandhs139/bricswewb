
const express = require('express'),
app = express(),
bodyParser = require('body-parser');
let port = process.env.PORT || 4000;
var cors = require('cors')
var https = require('https');
var http = require('http');
var fs = require('fs');


// var privateKey  = fs.readFileSync('/home/huberco/ssl/keys/f3e92_7a971_fec5b7cea5588fbd21944c89252adf3d.key', 'utf8');
// var certificate = fs.readFileSync('/home/huberco/ssl/certs/huber_co_in_f3e92_7a971_1658995343_01aba331aef433e210040644d15a3f69.crt', 'utf8');

// var credentials = {
//                    key: privateKey,
//                    cert: certificate
//                   };
// const options = {

//   key: fs.readFileSync("/home/huberco/ssl/97a5eca6bca560db.pem"),

//   cert: fs.readFileSync("/home/huberco/ssl/certs/huber_co_in_f3e92_7a971_1658995343_01aba331aef433e210040644d15a3f69.crt"),

//   ca: [

//           fs.readFileSync('/home/huberco/ssl/97a5eca6bca560db.crt'),

//           fs.readFileSync('/home/huberco/ssl/gd_bundle-g2-g1.crt')

//        ]
// };

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use('/api/', require('./app/routes/userRoutes'));
app.use('/api/', require('./app/routes/route'));
app.use(function(req, res) {
// Invalid request   
res.send({
    "statusCode": 500,
    "status": false,
    "message": "route not found",
    "data": {}
});
});

var httpServer = http.createServer(app);
//var httpsServer = https.createServer(credentials, app);

//httpServer.listen(4000);
//httpsServer.listen(8080);

app.listen(port, function() {
console.log("Server listening on port:%s", port);
});
//http.createServer(app).listen(8080);


