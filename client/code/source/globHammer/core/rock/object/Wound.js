
var Wound = function () { 
    
  var self = Object.create( module, {
  id:       { value:null,      	writable:true  }, 
  _value:   { value:1,   	      writable:true  },
  start:    { value:0,   	      writable:true  },
  end:      { value:0,      	  writable:true  },

  max:      { value:2  },
  min:      { value:-1 }

  });

  Object.defineProperty( self, "value", { configurable:true, set:function( input ){ 
    self._value = input;
    if ( self._value > self.max ) self._value = self.max;
    if ( self._value < self.min ) self._value = self.min;
  }} );


  Object.defineProperty( self, "value", { configurable:true, get:function( input ){ return self._value }} );
  
  return self; 
};

exports = module.exports = Wound;