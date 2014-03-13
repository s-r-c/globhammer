"use strict";

var GlobContent = function ( $core, $control ) { 
	
	//Create the vars
	var self =  Object.create( module, { 
	core:{ 		value:$core    	},
	control:{ 	value:$control },

	viewPort:{		value:{ x:0,	y:0 }, 	writable:true	},
	renderer:{  	value:null , 		     	writable:true	},
  view:{        value:null,           writable:true },
	stage:{  		  value:null , 			    writable:true	},

	environment:{  	value:null , 			  writable:true	},
	soulLayer:{    	value:null , 			  writable:true	},
	uiLayer:{   	value:null , 			    writable:true	},

  boundaryBox:{ value:null,           writable:true },

	physicsLayer:{  value:null , 			  writable:true	},
	
	lastStep:{ 	value:0, writable:true },
	remainder:{ value:0, writable:true },

  scale:{ value:1, writable:true },

  htmlContainer:{ value:null, writable:true },
  physicsCanvas:{ value:null, writable:true },

	});

	self.awake = function (){
    
    self.renderer  = PIXI.autoDetectRenderer( self.core.width, self.core.height );
    self.fps = 0;

    var view = self.view = self.renderer.view; // need to figure out with this is 
	  var div = self.htmlContainer = document.getElementsByTagName("div")[0];
	  div.appendChild( view );

    view.style.position = "absolute";
    view.webkitImageSmoothingEnabled = false;
    var HIGH_MODE = self.renderer instanceof PIXI.WebGLRenderer;
    var interactive = true;
    self.stage = new PIXI.Stage(0x00FF00, interactive);

    self.core.stage = self.stage;
    
    self.resize();
    self.update();     
    
    self.display         = new PIXI.DisplayObjectContainer;

    self.environment 		 = new PIXI.DisplayObjectContainer;
    self.soulLayer 			 = new  PIXI.DisplayObjectContainer;
    self.uiLayer			   = new PIXI.DisplayObjectContainer;
    self.physicsLayer		 = new PIXI.DisplayObjectContainer;
    
    self.display.addChild( self.environment );
    self.display.addChild( self.soulLayer );
    self.display.addChild( self.physicsLayer );
    self.display.addChild(self.uiLayer);

    self.stage.addChild( self.display  );
    
    self.physicsLayer.visible = false;

    var letterBox = $core.glob.createUI('LetterBox');
    //self.stage.addChild(letterBox.display );

    self.soulLayer.scale.x = 1;
    self.soulLayer.scale.y = 1;

    window.onresize = function( event ) { self.resize() };

    //physics
    var v = cp.v;
  	var space = self.core.space = new cp.Space();
  	space.iterations = 30;

  	space.gravity = v( self.core.gravityX, self.core.gravityY );
    space.damping = .1;

  	 window.requestAnimationFrame
  || window.webkitRequestAnimationFrame
  || window.mozRequestAnimationFrame
  || window.oRequestAnimationFrame
  || window.msRequestAnimationFrame
  || function(callback) { return window.setTimeout(callback, 1000 / 60); };

  // cp.PolyShape.prototype.draw = function( ctx, scale, point2canvas ) { self.drawPolyShape(ctx, scale, point2canvas) };
  cp.styles = [];

  for (var i = 0; i < 100; i++) {
  cp.styles.push("rgb(" + self.randColor() + ", " + self.randColor() + ", " + self.randColor() + ")");
  }
  
 //self.setUpPhysicsLayer();

 self.physicsCanvas = document.getElementById( "canvas2" );
 if ( self.core.debug == true  ) self.setUpPhysicsLayer(  );
 if ( self.core.debug == false  ) self.removePhysicsLayer( );
  //if ( self.control.debug == false ) self.removePhysicsLayer( );

  return self.core.glob;
  },

  self.randColor = function() { return Math.floor(Math.random() * 256); };

  self.setUpPhysicsLayer = function(  ){
    
    trace("seting setUpPhysicsLayer ");
    var canvas = self.physicsCanvas;
    if ( canvas == null ) return trace("no physics canvas present") 
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    self.ctx =  canvas.getContext('2d');
    self.htmlContainer.appendChild( canvas );
  },

  self.removePhysicsLayer = function(){
   trace("u removed");

   if ( self.physicsCanvas.parentNode != null ) self.physicsCanvas.parentNode.removeChild( self.physicsCanvas );

  }

  self.drawInfo = function() {

  var space = self.core.space;

  var maxWidth = self.core.width - 20;


  self.ctx.textAlign = 'start';
  self.ctx.textBaseline = 'alphabetic';
  self.ctx.fillStyle = "white";
  //this.ctx.fillText(this.ctx.font, 100, 100);
  var fpsStr = Math.floor(self.fps * 10) / 10;
  if (space.activeShapes.count === 0) {
    fpsStr = '--';
  }
  self.ctx.fillText("FPS: " + fpsStr, 10, 50, maxWidth);
  self.ctx.fillText("Step: " + space.stamp, 10, 80, maxWidth);

  var arbiters = space.arbiters.length;
  self.maxArbiters = self.maxArbiters ? Math.max( self.maxArbiters, arbiters) : arbiters;
  self.ctx.fillText("Arbiters: " + arbiters + " (Max: " + self.maxArbiters + ")", 10, 110, maxWidth);

  var contacts = 0;
  for(var i = 0; i < arbiters; i++) {
    contacts += space.arbiters[i].contacts.length;
  }
  self.maxContacts = self.maxContacts ? Math.max( self.maxContacts, contacts) : contacts;
  self.ctx.fillText("Contact points: " + contacts + " (Max: " + self.maxContacts + ")", 10, 140, maxWidth);

  if (self.message) {
    self.ctx.fillText( self.message, 10, self.core.height - 50, maxWidth);
  }
},

self.draw = function() {
  
  if ( self.ctx == null ) return
  var ctx = self.ctx;

  var space = self.core.space;

  // Draw shapes
  ctx.strokeStyle = 'green';
  ctx.clearRect(0, 0, self.core.width, self.core.height);

  self.ctx.font = "16px sans-serif";
  self.ctx.lineCap = 'round';

  space.eachShape(function(shape) {
    ctx.fillStyle = shape.style();

    var point = self.point2canvas;
    point.y -= 1000;
    shape.draw(ctx, self.scale, point );
  });



  // Draw collisions
  ctx.strokeStyle = "red";
  ctx.lineWidth = 2;

  var arbiters = space.arbiters;
  for (var i = 0; i < arbiters.length; i++) {
    var contacts = arbiters[i].contacts;
    for (var j = 0; j < contacts.length; j++) {
      var p = self.point2canvas(contacts[j].p);

      ctx.beginPath()
      ctx.moveTo(p.x - 2, p.y - 2);
      ctx.lineTo(p.x + 2, p.y + 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(p.x + 2, p.y - 2);
      ctx.lineTo(p.x - 2, p.y + 2);
      ctx.stroke();
    }
  }

  if (this.mouseJoint) {
    ctx.beginPath();
    var c = self.point2canvas( self.mouseBody.p);
    ctx.arc(c.x, c.y, self.scale * 5, 0, 2*Math.PI, false);
    ctx.fill();
    ctx.stroke();
  }

  space.eachConstraint(function(c) {
    if(c.draw) {
      c.draw(ctx, self.scale, self.point2canvas);
    }
  });

   
  self.drawInfo();

 //ctx.translate(  0, self.core.height );
  //ctx.scale( 1, -1);
},

	self.update = function (){
		self.renderer.render( self.stage);
		requestAnimFrame( self.update);
		if ( self.core.world == null ) return;
		if ( self.core.world.update == null ) return;	
  		self.control.execute();
      self.core.world.update();
  		self.step();
	},

	self.render = function (){
		self.soulLayer.position.x 		= self.core.x * -1;;
		self.soulLayer.position.y 		= self.core.y;
		self.physicsLayer.position.x 	= self.core.x * -1;
		self.physicsLayer.position.y 	= self.core.y;

    //body.setPos(v( rock.x, rock.y) );
	},

	self.resize = function(){
  		
      return;

      var width;
      var height;

      var width = $(window).width(); 
  		var height = $(window).height(); 

  		var globWidth   = self.core.width;
  		var globHeight  = self.core.height;
  		var ratio = width / globWidth;

		  //if ( height > width)
		 // {
		 //   var temp = width;
		 //   width = height;
		 //   height = temp;
		 // }

  	//	self.core.width = width;
  //		self.core.glob.height = height;
  
  		//self.core.glob.y = 400;
  		//world.x = world.viewPort.width + 10000; NOT REALLY SURE WHAT THIS DOES
   
  		var view = self.view;
  		view.style.height = height +"px"
  
  		view.style.height = globHeight * ratio +"px"
  		//var newWidth = (width /ratio);
  		view.style.width = globWidth * ratio +"px"
  		self.renderer.resize( width, height );
  	}

  self.addBoundary = function ( x, y, w, h ){
    var space       = self.core.space;
    var staticBody  = space.staticBody;
    

    var bound = new cp.SegmentShape(staticBody, cp.v( x, y), cp.v( w, h), 0);
    bound.setElasticity(0);
    bound.setFriction(0);
    //wall.setCollisionType(COLLISION_TYPE_FLOOR);
    space.addStaticShape( bound );


    if ( self.core.debug == false ) return;

    var graphics = self.boundaryBox = new PIXI.Graphics();
    graphics.lineStyle(5, 0xFF0000);
    graphics.moveTo(x,y);
    graphics.lineTo( w, h);
    //self.boundaryBox.beginFill( 0xFFFF00, .1  );
    //self.boundaryBox.lineStyle( 5, 0xFF0000 );
    //self.boundaryBox.drawRect(  x, y, w, h  );
    self.physicsLayer.addChild( self.boundaryBox );
  }

	self.step = function() {
  
  		var now = Date.now();
  		var dt = (now - self.lastStep) / 1000;
  		self.lastStep = now;

  		var space = self.core.space;
  		if ( space == null ) return;


  		dt = Math.min(dt, 1/25);
  		self.remainder += dt;


      //Update FPS
      if(dt > 0) {
      self.fps = 0.7* self.fps + 0.3*(1/dt);
      }

  		while( self.remainder > 1/60) { self.remainder -= 1/60; }

      self.physicsRemove();

  		var lastNumActiveShapes = space.activeShapes.count;
  		//if (lastNumActiveShapes <=  0 ) return
  		
  		self.core.space.step(dt);
      self.draw();
      // check and see if anything needs to be removed from the physics
     
	}

  
  self.physicsRemove = function(){

    var space           = self.core.space;

    var bodyRemoveList  = self.core.bodyRemoveList;
    var shapeRemoveList = self.core.shapeRemoveList;

    var max = bodyRemoveList.length;
    var i;

    for ( i = 0; i < max; i++ ){
      var bodyRock = bodyRemoveList[ i ];
      if ( space.containsBody( bodyRock.body ))  space.removeBody( bodyRock.body );
      if ( space.containsShape( bodyRock.shape  )) space.removeShape( bodyRock.shape );

      //if (  self.core.glob.physicsLayer.removeChild( bodyRock.physicsDisplay );
  
    }

    
    self.core.bodyRemoveList = [];
    self.core.shapeRemoveList = [];

  }


	cp.canvas2point = function(x, y) {
    return cp.v(x / self.scale, self.core.height - y / self.scale);
	};

	self.point2canvas = function(point) {
    //  return cp.v(point.x * self.scale - GLOB.glob.x, (  point.y ) * self.scale);  // BEFORE THE REVERSAL
    return cp.v(point.x * self.scale - GLOB.glob.x, (  point.y ) * self.scale + GLOB.glob.y);
	};




//PHYSICS FUNCTIONS


cp.Shape.prototype.style = function() {
  var body;
  if (this.sensor) {
    return "rgba(255,255,255,0)";
  } else {
    body = this.body;
    if (body.isSleeping()) {
      return "rgb(50,50,50)";
    } else if (body.nodeIdleTime > this.space.sleepTimeThreshold) {
      return "rgb(170,170,170)";
    } else {
      return cp.styles[this.hashid % cp.styles.length];
    }
  }
};

cp.drawCircle = function(ctx, scale, point2canvas, c, radius) {
 
  var c = point2canvas(c);
  ctx.beginPath();
  ctx.arc(c.x, c.y, scale * radius, 0, 2*Math.PI, false);
  ctx.fill();
  ctx.stroke();
};

cp.drawLine = function(ctx, point2canvas, a, b) {
  a = point2canvas(a); b = point2canvas(b);

  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
};



// **** Draw methods for Shapes

cp.PolyShape.prototype.draw = function(ctx, scale, point2canvas)
{
  ctx.beginPath();

  var verts = this.tVerts;
  var len = verts.length;
  var lastPoint = point2canvas(new cp.Vect(verts[len - 2], verts[len - 1]));
  ctx.moveTo(lastPoint.x, lastPoint.y);

  for(var i = 0; i < len; i+=2){
    var p = point2canvas(new cp.Vect(verts[i], verts[i+1]));
    ctx.lineTo(p.x, p.y);
  }
  ctx.fill();
  ctx.stroke();
};

cp.SegmentShape.prototype.draw = function(ctx, scale, point2canvas) {
  var oldLineWidth = ctx.lineWidth;
  ctx.lineWidth = Math.max(1, this.r * scale * 2);
  cp.drawLine(ctx, point2canvas, this.ta, this.tb );
  ctx.lineWidth = oldLineWidth;
};

cp.CircleShape.prototype.draw = function(ctx, scale, point2canvas) {
  cp.drawCircle(ctx, scale, point2canvas, this.tc, this.r);
  cp.drawLine(ctx, point2canvas, this.tc, cp.v.mult(this.body.rot, this.r).add(this.tc));
};


// Draw methods for constraints

cp.PinJoint.prototype.draw = function(ctx, scale, point2canvas) {
  var a = this.a.local2World(this.anchr1);
  var b = this.b.local2World(this.anchr2);
  
  ctx.lineWidth = 2;
  ctx.strokeStyle = "grey";
  drawLine(ctx, point2canvas, a, b);
};

cp.SlideJoint.prototype.draw = function(ctx, scale, point2canvas) {
  var a = this.a.local2World(this.anchr1);
  var b = this.b.local2World(this.anchr2);
  var midpoint = v.add(a, v.clamp(v.sub(b, a), this.min));

  ctx.lineWidth = 2;
  ctx.strokeStyle = "grey";
  drawLine(ctx, point2canvas, a, b);
  ctx.strokeStyle = "red";
  drawLine(ctx, point2canvas, a, midpoint);
};

cp.PivotJoint.prototype.draw = function(ctx, scale, point2canvas) {
  var a = this.a.local2World(this.anchr1);
  var b = this.b.local2World(this.anchr2);
  ctx.strokeStyle = "grey";
  ctx.fillStyle = "grey";
  drawCircle(ctx, scale, point2canvas, a, 2);
  drawCircle(ctx, scale, point2canvas, b, 2);
};

cp.GrooveJoint.prototype.draw = function(ctx, scale, point2canvas) {
  var a = this.a.local2World(this.grv_a);
  var b = this.a.local2World(this.grv_b);
  var c = this.b.local2World(this.anchr2);
  
  ctx.strokeStyle = "grey";
  drawLine(ctx, point2canvas, a, b);
  drawCircle(ctx, scale, point2canvas, c, 3);
};

cp.DampedSpring.prototype.draw = function(ctx, scale, point2canvas) {
  var a = this.a.local2World(this.anchr1);
  var b = this.b.local2World(this.anchr2);

  ctx.strokeStyle = "grey";
  drawSpring(ctx, scale, point2canvas, a, b);
};







//




	return self; 
};

exports = module.exports = GlobContent;