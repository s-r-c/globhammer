exports.actions = function(req, res, ss){

  // return list of actions which can be called publicly
  return {

    fetchFiles: function( avatarID, root, dir, location ){
      
      var fs 	= require('fs');

      console.log(  avatarID + " requests fileList for " + dir );

      //var files = fs.readdirSync( root + "/" + dir );
      var avatarLocation = root  + dir;
      console.log( "avatar location " + avatarLocation );
   
      var files = fs.readdirSync( avatarLocation );
      
      var output = [];

      var max = files.length;

      for ( var i = 0; i < max; i++ )
      {
        var url = files[ i ];

        //checking to see if the file is a javascript file
        var isJS;
        var jsCheck = url.split(".");
        
        //we have a js file
        if ( jsCheck.length > 1 ) continue;

        var subFileLocation = root + dir  + url;
        console.log( "sub file location " + subFileLocation );
        var frameList = fs.readdirSync( subFileLocation );
        var maxFrames = frameList.length;
        var frames = [];

        for ( var b = 0; b < maxFrames; b++ )
        {
          var frameURL = frameList[ b ];
          var package = dir + "/" + url + "/" + frameURL; 
          console.log( "p-p-p " + package );
          frames.push( package );
        }

        var item = {};
        item.id = url;
        item.frameList = frames;
        item[ dir ] = frames; 
        output.push( item );
      }

        //output.push{ id:url, toonList:frames };
        //i changed the id here
        var data = { soulLocation:location, avatarLocation:avatarLocation, id:avatarID, fileList:output };
        console.log("sending out data " + data );
        ss.publish.socketId(req.socketId,'toonList', data ); 
    }

  }
}

exports.end = function(){

}