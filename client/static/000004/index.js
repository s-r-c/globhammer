world = {
  
  name:" Title 1",

  bounds: [
          {x:-2000, w:1100,         y:600,  h:600},
          {x:1100, w:1800,          y:600,  h:600},
          {x:1800, w:200000,        y:600,  h:600},
          ],

  follow:false,
  allowControl:false,

  awake:function( glob )  {  
    glob.debug          = true;
    world.glob          = glob;
    art.desert          = glob.rockFile("glowForestGreen");
    art.hero            = glob.rockFile('hero');
    art.skySpheres      = glob.rockFile('skySpheres', 'toon');
   // art.caretaker       = glob.rockFile('caretaker');

    world.glob.stage.mousedown = world.stageDown;
    world.glob.stage.mouseup   = world.stageUp;

    $("body").keydown(function (key) {  world.keydown( key.which ); });
    $("body").keyup(function (key)   {  world.keyup(   key.which ); });
  },


  awakeComplete:function( glob ) {
      
      trace("awakeComplete");

    var glob = world.glob;
    var toon;
    
    toon = world.desert = glob.addRock( art.desert, glob.width, 0  );
    toon = world.hero = glob.addRock( art.hero, 2200, 500 );

    glob.addRock( art.skySpheres, 2200, 400 );
    glob.addRock( art.skySpheres, 4200, 400 );
    glob.addRock( art.skySpheres, 6200, 400 );
    //toon = world.chain = glob.addRock( art.chainsaw, 2200, 500  );
    //toon.display.visible = false;

   // toon = world.caretaker = glob.addRock( art.caretaker, 1900, 500 );


    //glob.addRock( art.caretaker, 3000, 0 );
    
    //setTimeout(world.phase1, 3000);
  // world.phase1();
    //setInterval( world.addBat, 6000  );
    
  },

  switchPower:function(){

    world.chain.body.p = world.hero.body.p;

     // world.chain.body.p          = world.hero.body.p;
     // world.chain.shape.layers    = world.hero.shape.layers;
     // world.hero.shape.layers = null;
     // world.glob.addRock( world.chain );
     // world.glob.removeRock( world.hero );
     // trace("switchPower ");

     // setTimeout( world.powerEnd, 2000 );
  },

  powerEnd:function(){

      //world.hero.body.p =  world.chain.body.p;
      //world.hero.shape.layers = world.chain.shape.layers;
      //world.chain.shape.layers = null;
      
      //world.glob.removeRock( world.chain );
      //world.glob.addRock( world.hero );
  },

  keydown:function( key ){ 

  if ( world.allowControl == false ) return
  if ( key == 37 ) world.hero.soul.moveLeft( world.hero );
  if ( key == 39 ) world.hero.soul.moveRight( world.hero );
  if ( key == 38 ) world.hero.soul.jump( world.hero );

  //if ( key == 32 ) world.switchPower(); 
    //if ( key == 37 ) world.prevToon();  
  },

  keyup:function( key ){ 
  if ( world.allowControl == false ) return
  if ( key == 37 ) world.hero.soul.moveReset(   world.hero  );
  if ( key == 39 ) world.hero.soul.moveReset(   world.hero  );
  if ( key == 38 ) world.hero.soul.jumpEnd(     world.hero  );
    //if ( key == 37 ) world.prevToon();  
  },

  stageDown:function( interactionData ){
    //trace( "DATA " + interactionData.mouse.x );
     var mousePoint = world.glob.core.stage.getMousePosition();
      world.toon.x = mousePoint.x;
      world.toon.y = mousePoint.y;

      var middle = world.glob.width * .5;

      if ( mousePoint.x > middle  )  world.left = true;
      if ( mousePoint.x < middle  )   world.right = true;    
     // 
  },

  stageUp:function( interactionData ){
      world.left = false;
      world.right = false;
      world.hero.core.body.resetForces();
  },

  addCaretaker:function(){},
  addRoach:function(){},
  addTimeGhoul:function(){},
  addMisero:function(){},
  addPlantShark:function(){},
  addWolfBeast:function(){},
  addYagee:function(){},
  addMinusBitus:function(){},
  addKingRoach:function(){},

  phase0:function(){

  },

  phase1: function () {
      //world.hero.soul.moveRightAutoStart( world.hero );
      setTimeout(world.phase2, 1000);
  },

  phase2: function () {
      world.follow = true;
     // world.hero.soul.moveRightAutoEnd( world.hero );
      world.allowControl = true;
      //setTimeout(world.phase3, 1000);
  },

  phase3: function () {
      world.toon.show = 'bite';
      setTimeout(world.phase3b, 500 );
  },

  phase3b: function () {
      world.toon.show = 'bite';
      setTimeout(world.phase4, 300 );
  },

  phase4: function () {
      world.toon.show = 'idle';
      setInterval ( world.move, 400 );
  },

  move:function(){
  //var pos = world.toon.x - 30;
   //TweenMax.to( world.toon, .2, { x: pos, delay:.16 });
  },

 
  update:function(){  

    if ( world.desert == null ) return;
    if ( world.hero == null ) return;
    
    if (world.desert.content.updateLandscapeX == null) return;
    world.desert.content.updateLandscapeX( world.glob.x + 15000 );

    //TweenMax.to( world.skySpheres, .2, { x:world.hero.x + Math.random * 10, delay:1 });

    // = ;
    if ( world.follow == true ) 
    {
     var pos = world.hero.x - world.glob.width * .25;
     TweenMax.to( world.glob, .6, { x: pos, delay:0 });
    }
    
    var hero = world.hero;

    var body = hero.core.body;

      

    //trace( body.p.y );

   //if ( body.p.y > 665 ) body.p.y = 665;

    //if ( hero.y > 300 )hero.y = 300;

    //trace( hero.y );


    //var mousePoint = world.glob.core.stage.getMousePosition();
    //world.toon.x = mousePoint.x;
    //world.toon.y = mousePoint.y;
  },

}


//var unitedStatesSupremeCourt = 9;
//  var samsung18CuFtFrenchDoorRefrigeratorStainlessSteel = 1499.99;
//  var freezingPointOfWaterKelvin = 273.16;
//  var globs = 2;
//  var hammers =  Math.pow( freezingPointOfWaterKelvin, globs);  // editions;
//  hammers = hammers - unitedStatesSupremeCourt * samsung18CuFtFrenchDoorRefrigeratorStainlessSteel;
//  hammers *= .5;
//  hammers *= .5;