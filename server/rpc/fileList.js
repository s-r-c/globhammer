exports.actions = function(req, res, ss){

  // return list of actions which can be called publicly
  return {

    fetchFiles: function( id, root, dir, location ){
      
      var fs 	= require('fs');

    
      var files = fs.readdirSync( root + "/" + dir );
      var output = [];

      var max = files.length;

      for ( var i = 0; i < max; i++ )
      {
        var url = files[ i ];
        output.push( dir + "/" + url );
      }

      var data = { soulLocation:location, id:id, fileList:output };

     ss.publish.socketId(req.socketId,'fileList', data ); 
    }

  }
}

exports.end = function(){

}