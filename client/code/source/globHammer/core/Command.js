
var Command = function ( $glob,  $source, $target ) { 
  
  //Create the vars
  var self = Object.create( module, {
  glob:  { value:$glob,   	writable:true  }, 
  target:  { value:$target,   	writable:true  },
  source:  { value:$source,   	writable:true  },
  value:   { value:null,      	writable:true  },

  last:   { value:0,      	writable:true  },
  delay:  { value:1,      	writable:true  },
  next:   { value:0,      	writable:true  },

  });

  self.execute = function ( target ){}

  
  return self; 
};

exports = module.exports = Command;