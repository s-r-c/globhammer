exports.actions = function(req, res, ss){

  // return list of actions which can be called publicly
    return {

    fetchWorld: function( dir ){
        ss.publish.all('trace', dir);
        var fs = require('fs');
        fs.readdir('', exports.end)
        var file = fs.readFileSync( dir, 'utf8');
        ss.publish.socketId(req.socketId,'addWorld', file );  
    },


  }
}

exports.end = function(){

}