window.GLOB = {};
window.GLOB.glob = {};


window.trace = function (msg){
  console.log( "LOG: " + msg );
}

window.ss = require('socketstream');

ss.server.on('disconnect', function(){
  console.log('Connection down :-(');
});

ss.server.on('reconnect', function(){
  console.log('Connection back up :-)');
});

ss.server.on('ready', function(){

  jQuery(function(){

  var glob   = require("/globHammer/core/Glob")("Source");
  GLOB.awake( glob );
  });


  


});
