exports.actions = function(req, res, ss){

  // return list of actions which can be called publicly
  return {

    screams: function( src ){
    	console.log("dieing" + src );
    	ss.publish.die('die', src );
    }

  }
}

exports.end = function(){

}