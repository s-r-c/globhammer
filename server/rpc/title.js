exports.actions = function(req, res, ss){

  return {

    fetchTitle: function( dir ){
        ss.publish.all('trace',  dir );
        var fs 	= require('fs');
        fs.readdir( '' , exports.end )
        var file = fs.readFileSync( dir, 'utf8');
        ss.publish.socketId(req.socketId,'title', file );  
    }

  }
}

exports.end = function(){

}