
var Strike = function ( $glob, $source,  $target )  { 
  
  var self = require( "globHammer/core/Command" )( $glob, $source, $target );
  
  self.execute = function ( target ){      
      if ( self.glob.round < self.next ) return target.dodge();
      self.last = self.glob.round;
      self.next = self.last + self.delay;

      if ( target != null ) self.target = target;

      //self.glob.updateCamera( 2, -400, -200 );
      self.action1();

      //TweenLite.to( self.source, .75, { x:target.x -50, y:target.y - 50, onComplete:self.action1});
  }


  self.action1 = function(){
      
      var pool = self.source.stat('touch');
      pool += self.source.skill('fightClose');
    
      var fate = self.glob.fate( pool );
      //if ( fate <= 0 ) return self.target.dodge(); NO DODGING ALLOWED FOR THE TIME BEING
        
      fate = self.glob.fate( self.source.stat('body') ) + fate;
      self.target.addWound( fate, 1 ); 

      //TweenLite.to( self.source, .75, { x:self.startX, y:self.startY } );


      //self.glob.updateCamera( 1, 0, 0 );
    
  }

  self.name = "Strike";
  self.startX = self.source.x;
  self.startY = self.source.y;
  self.delay = 0;
  
  return self; 
};

exports = module.exports = Strike;