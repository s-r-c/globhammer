
var Heal = function ( $glob, $source, $target )  { 
  
  var self = require( "globHammer/core/Command" )( $glob, $source, $target );
  
  self.execute = function ( target ){

      if ( self.glob.round < self.next ) return;
      self.last = self.glob.round;
      self.next = self.last + self.delay;

      if ( target != null ) self.target = target;
      var pool = self.source.stat('touch');
      pool += self.source.skill('fightClose');
    
      var fate = self.glob.fate( pool );
      if ( fate <= 0 ) return

      fate = self.glob.fate( self.source.stat('body') ) + fate + 1;
      for ( var i = 0; i < fate; i++ ){ self.target.removeWound( -1 ); }
  }

  self.name = "Heal";
  
  return self; 
};

exports = module.exports = Heal;