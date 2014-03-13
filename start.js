// My SocketStream 0.3 app

var http = require('http'),
    reload = require('reload'),
    ss = require('socketstream');

// Define a single-page client called 'main'
ss.client.define('main', {
  view: 'app.html',
  css:  ['libs/reset.css', 'app.styl'],
  code: ['libs/jquery.min.js', 'app'],
  tmpl: '*'
});

 ss.client.define( "see", {
  view: 'src720.html',
  css:  ['libs' ],
  code: ['libs/jquery.min.js', 'libs/cp.min.js', 'libs/buffer-loader.js', 'libs/pixi.js', 'libs/TweenMax.min.js', 'libs/chance.js', 'source'],
  tmpl: '*'
  });

// Serve this client on the root URL
ss.http.route('/', function(req, res){
  res.serveClient('see');
});


// Minimize and pack assets if you type: SS_ENV=production node app.js
if (ss.env === 'production') ss.client.packAssets();

// Start web server
var server = http.Server(ss.http.middleware);
server.listen(3000);
    
// Start SocketStream
ss.start(server);

//reload(server, ss )

//server.listen(app.get('port'), function () {
//    console.log("Web server listening on port " + app.get('port'));
//});
