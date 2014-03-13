exports.actions = function(req, res, ss){

  // return list of actions which can be called publicly
  return {

    go: function( src, x, y  ){
      
      console.log("moving " + src );   
      ss.publish.all( 'go', src, x, y );  
    
    },

    die: function( src ){
    	console.log("dieing" + src );
    	ss.publish.die('die', src );
    }

  }
}

exports.end = function(){

}