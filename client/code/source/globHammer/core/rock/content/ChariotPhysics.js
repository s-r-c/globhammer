
var ChariotPhysics = function ( $core, $control ) { 
	
var self = require( "/globHammer/core/rock/content/Chariot" )( $core, $control );

self.physicsDisplay = null;

self.execute = function(){
    	      
   var shape  = self.core.shape;
   var body   = self.core.body; 

    if ( shape != null ){
        //var point = new cp.v( shape.tc.x , shape.tc.y ); 
       
       // var point = new cp.v( shape.tc.x , shape.tc.y ); 
       // point = self.point2canvas( point );
        self.core.rock.x  = body.p.x;
        self.core.rock.y  = body.p.y;
    }

    self.display.position.x = self.core.rock.x + self.core.offset.x;
    self.display.position.y = self.core.rock.y + self.core.offset.y;

	}

  self.remove = function (){

    if ( self.core.glob.soulLayer == null ) return

    if ( self.display.parent == self.core.glob.soulLayer ) 
      {
        self.core.glob.soulLayer.removeChild( self.display );
      }
      else {
        trace("the parent is not the soul layer ");
        self.display.parent.removeChild( self.display );
      }
    
    if ( self.core.body   != null  )  self.core.glob.removeRockPhysics( self.rock );

    if ( self.core.glob.debug == false ) return;

  }

  self.dead = function( rock ){ self.core.glob.removeRockPhysics( rock ); }

  self.awake = function( rock ){

  self.rock = rock;
  rock.addEventListener( rock.event.DEAD, self.dead ); 

  var soul = self.core.soul;
  var max = soul.toonList.length;

    for ( var i = 0; i < max; i++ )
    {
      var toon = soul.toonList[ i ];
      self.buildToon( toon );
    }

  self.core.glob.soulLayer.addChild( self.display );

  //MAIN PHYSICSif
  if ( rock.core.rim == null)  self.createBox( rock );
  if ( rock.core.rim != null)  self.createCircle( rock );

}

self.createBox = function( rock ){
  var v = cp.v;
  var space = rock.glob.core.space;
  var radius = rock.core.rim;
  var body, staticBody = space.staticBody;
  var shape;

  body = space.addBody(new cp.Body(10, cp.momentForBox(10, rock.core.physicWidth, rock.core.physicHeight )));
  body.setPos(v( rock.x, rock.y) );

  shape = space.addShape(new cp.BoxShape(body, rock.core.physicWidth, rock.core.physicHeight ));
  shape.setElasticity(0);
  shape.setFriction(0.9);
  //shape.group = Math.random * 10;
 if ( self.core.collideType != null ) shape.collision_type = self.core.collideType;

  rock.core.shape = shape;
  rock.core.body = body;
//self.enableCollisionEvents( true );

  shape.rock  = self.core.rock;
  body.rock   = self.core.rock;

}

self.createCircle = function ( rock ){
  var v = cp.v;
  var space = rock.glob.core.space;
  var radius = rock.core.rim;
  var body, staticBody = space.staticBody;
  var shape;

  body = space.addBody(new cp.Body(10, cp.momentForCircle(10, 0, radius, v(0,0))));
  body.setPos(v( rock.x, rock.y) );

  shape = space.addShape(new cp.CircleShape(body, radius, v(0,0)));
  shape.setElasticity(0);
  shape.setFriction(0.9);
  //shape.group = Math.random * 10;
 if ( self.core.collideType != null ) shape.collision_type = self.core.collideType;

  rock.core.shape = shape;
  rock.core.body = body;
//self.enableCollisionEvents( true );

  shape.rock  = self.core.rock;
  body.rock   = self.core.rock;
}


self.createCircle = function ( rock ){
  var v = cp.v;
  var space = rock.glob.core.space;
  var radius = rock.core.rim;
  var body, staticBody = space.staticBody;
  var shape;

  body = space.addBody(new cp.Body(10, cp.momentForCircle(10, 0, radius, v(0,0))));
  body.setPos(v( rock.x, rock.y) );

  shape = space.addShape(new cp.CircleShape(body, radius, v(0,0)));
  shape.setElasticity(0);
  shape.setFriction(0.9);
  //shape.group = Math.random * 10;
 if ( self.core.collideType != null ) shape.collision_type = self.core.collideType;

  rock.core.shape = shape;
  rock.core.body = body;
//self.enableCollisionEvents( true );

  shape.rock  = self.core.rock;
  body.rock   = self.core.rock;
}

self.enableCollisionEvents = function (enabled) {
  
  var space       =   self.rock.glob.core.space;
  var passThru    =   self.core.soul.passThru;
  var collide     =   self.core.soul.collide;

  trace("u got space " + space );

  space.addCollisionHandler( 0, 2, null, null, self.onCollision.bind( this ), null );

  //if (enabled == true ) {
  //    if ( collide   != null ) 
  //    if ( passThru  != null ) space.addCollisionHandler( 0, 1, self.onCollisionPassThru.bind(this), null, null, null );
  //}  

  //if (!enabled) space.removeCollisionHandler( 0, 1);

};

self.makeItPass = function(   ){
   var space     =   self.rock.glob.core.space;

  space.addCollisionHandler( 0, 1, self.onCollisionPassThru.bind(this), null, null, null );

  trace("are u pass ");
}

self.onCollision = function ( arbiter, space ) {
    
    trace(" collide ");

    if (arbiter == null) return;
    if (space == null) return;

    var a = arbiter.getA();
    var b = arbiter.getB();

    var rockA = a.rock;
    var rockB = b.rock;

    

    //if ( rockA == null ) return trace("rockA " + rockA.id);
    //if ( rockB == null ) return;

    //trace( "U down here ");


    //if ( rockA.control.collide != null )  rockA.control.collide( rockA, rockB ); //SO WIERD that i must go through the control
    //if ( rockB.control.collide != null )  rockB.control.collide( rockB, rockA );

}

self.onCollisionPassThru = function( arbiter, space ){
    trace('coul pass thur');

    if (arbiter == null) return;
  if (space == null) return;

  
  var a = arbiter.getA();
  var b = arbiter.getB();

  var rockA = a.rock;
  var rockB = b.rock;

  if ( rockA == null ) return;
  if ( rockB == null ) return;

  if ( rockA.control.passThru != null )  rockA.control.passThru( rockA, rockB ); //SO WIERD that i must go through the control
  if ( rockB.control.passThru != null )  rockB.control.passThru( rockB, rockA );


}

//self.onCollision = function ( arbiter, space ) {


//if ( arbiter == null )  return;
//if ( space == null )    return;

//var a = arbiter.getA();
//var b = arbiter.getB();

//var rockA = a.rock;
//var rockB = b.rock;

//if ( rockA == null ) return;
//if ( rockB == null ) return;

//trace("getting close ");

//rockA.control.collide( rockA, rockB ); //SO WIERD that i must go through the control
//rockB.control.collide( rockB, rockA );

//var bodies = arbiter.getBodies();
//var shapes = arbiter.getShapes();
//var collTypeA = shapes[0].collision_type;
//var collTypeB = shapes[1].collision_type;
//var shapeCoin = (collTypeA == COLLISION_TYPE_COIN) ? shapes[0] : shapes[1];
// XXX: hack to prevent double deletion... argh...
// Since shapeCoin in 64bits is a typedArray and in 32-bits is an integer
// a ad-hoc solution needs to be implemented
//if (this._shapesToRemove.length === 0) {
// since Coin is a sensor, it can't be removed at PostStep.
// PostStep is not called for Sensors
//this._shapesToRemove.push(shapeCoin);
//audioEngine.playEffect(PickupCointWAV);
//this.addScore(1);
//}


self.point2canvas = function( point ) {
    if ( self.rock.glob == null ) trace("something is going bad ");
    //var newY = self.rock.glob.height - point.y;
    
    var y = point.y;
    var x = point.x

    return cp.v( x , y );
  };


return self; 
};

exports = module.exports = ChariotPhysics;