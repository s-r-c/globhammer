
exports.actions = function(req, res, ss){

  // return list of actions which can be called publicly
  return {

    fetchSoul: function( dir, root, skin, id ){
      console.log("Fetching Soul from " + dir ); 
      var fs 	= require('fs');
      fs.readdir( '' , exports.end )
      var file = fs.readFileSync( dir, 'utf8');

      var data = {location:dir, soul:file, root:root, skin:skin, id:id };
      ss.publish.socketId(req.socketId,'addSoul', data ); 
    }

  }
}

exports.end = function(){

}