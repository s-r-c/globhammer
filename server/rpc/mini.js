exports.actions = function(req, res, ss){

  // return list of actions which can be called publicly
  return {

    die: function( src  ){
      
    
      ss.publish.all( 'die', src );  
    
    }

  }
}

exports.end = function(){

}