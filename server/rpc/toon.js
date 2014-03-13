exports.actions = function(req, res, ss){

  // return list of actions which can be called publicly
  return {

    fetchFrames: function( dir , type){
      
      var fs 	= require('fs');
      //fs.readdir( '' , exports.end )
      var files = fs.readdirSync( dir );
      var output = [];

      var max = files.length;

      for ( var i = 0; i < max; i++ )
      {
        var url = dir + "/" + files[ i ];
        var s = url.split('static/');
        output.push( s[1] );
      }

      ss.publish.all('addFrames', output, type ); 
      res( type );
    }

  }
}

exports.end = function(){

}