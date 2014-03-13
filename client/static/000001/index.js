world = {
  
  name:" Title 1",

   bounds: [
          { x: -2000, w: 11000, y: 900, h: 900 },
          { x: -2000, w: 11000, y: 500, h: 500 },
   ],

   startX: 1000,
   sfx:[ 'spaceBlaster.wav', 'rise.wav', 'sweep.wav', 'target.wav', 'laser.wav' ],


  awake:function( glob )  {  
    glob.debug          = false;
    world.glob          = glob;
    art.space           = glob.rockFile('template');
   art.sky = glob.rockFile('sky');
   art.desert = glob.rockFile('desert');
    art.touch = glob.rockFile('touch');

    art.un = glob.rockFile('untitled');
   art.bomb = glob.rockFile('globBomb');
    art.hit   = glob.rockFile("feely"); 
   

   art.title = glob.rockFile('globTitle');

    var context;
    window.addEventListener('load', init, false);
    function init() {
        try {
            // Fix up for prefixing
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            context = new AudioContext();
        }
        catch (e) {
            alert('Web Audio API is not supported in this browser');
        }
    }

  },

  awakeComplete:function( glob ) {
    var glob = world.glob;
    var toon;
    
    //glob.uiLayer.addChild(toon.display);

    //toon = world.space = glob.addRock( art.space,  961, 540 ); 
    var startX = world.startX; 

      toon = world.hit  = glob.addRock( art.hit, 960, 540 );
      toon.display.alpha = 0;
      
   toon = world.sky = glob.addRock(art.sky, 960, 540);

    toon = world.land = glob.addRock(art.desert, 958, 400);
    toon = world.un         = glob.addRock(art.un, 900, 800);
    world.un.scaleX         = world.un.scaleY = .35;
  toon = world.bomb       = glob.addRock(art.bomb, 258, 250);
  toon = world.title = glob.addRock(art.title, 960, 540);
  world.glob.uiLayer.addChild(toon.display);

  toon = world.touch = glob.addRock(art.touch, 60, 840);
  
    world.phase1();

    var max = world.sfx.length;
    for (var i = 0; i < max; i++) {
        var url = world.sfx[i];
        world.loadSound( url );
    }

    glob.soulLayer.setInteractive(true);
    glob.soulLayer.click = world.babysOnFire;
  },

    babysOnFire:function( data ){
        var pos = data.getLocalPosition(data.target);

        if (pos.y < 500) return;
      
        var v = cp.v;
        world.touch.body.setPos(v(pos.x, pos.y));

        world.touch.show = 'grow';
        //world.playSFX('rise.wav');
        //world.glob1.soul.fretNot( world.glob1, pos.x, pos.y );
  },

 playSFX: function ( url ) {
     var buffer = world[url];
     if (buffer == null) return;
     window.AudioContext = window.AudioContext || window.webkitAudioContext;
     var context = new AudioContext();
     var source = context.createBufferSource(); // creates a sound source
     source.buffer = buffer;                    // tell the source which sound to play
     source.connect(context.destination);       // connect the source to the context's destination (the speakers)
     source.start(0);                           // play the source now
// note: on older systems, may have to use deprecated noteOn(time);
 },

 loadSound:function( url ){
     var dogBarkingBuffer = null;
     world[url] = url;
     window.AudioContext = window.AudioContext || window.webkitAudioContext;
     var context = new AudioContext();
     var request = new XMLHttpRequest();
     request.open('GET', url, true);
     request.responseType = 'arraybuffer';
     request.id = url;
        request.onload = function( buffer ) {
             context.decodeAudioData(request.response, function(buffer) {
                 world[url] = buffer;
     }, world.onError);
         }
         request.send();     
 },

onError:function() { "intregity breach" },

 phase1: function () { setTimeout(world.phase2, 1000) },

  phase2:function(){
      world.playSFX('spaceBlaster.wav');
      setTimeout(world.phase3, 2500);
    },

  phase3:function(){
      world.playSFX('rise.wav');
      world.un.show = "rebirth";
      setTimeout(world.phase4, 3700);
  },

  phase4:function(){
      world.playSFX('sweep.wav');
      setTimeout(world.phase5, 2000);
  },

  phase5: function () {
      //world.playSFX('target.wav');
      setTimeout(world.phase6, 600);
      world.center = true;
  },

  phase6: function(){
    //  world.bomb.soul.trigger(world.bomb);
      world.un.soul.walk( world.un );

  },



 
  update: function () {

      if (world.land == null) return;
      if (world.un == null) return;
      if (world.bomb == null) return;
      if (world.title == null) return;

      //var x = world.un.x;

      if (world.center == true) world.un.x -= 1;

      var time = 1;
      var mid = 0;
      //var oldX = world.glob1.x;
      //var oldX = x;
      //var newX = oldX  + mid;

      //var leftBound = world.startX;
      //leftBound *= -1;
      //leftBound += mid;

      //if (world.center == true) {
          //newX = world.startX + leftBound;
      //    trace("gooo ");
          //time = 0;

       //   if (newX >= leftBound) {
       //       newX =  leftBound;
       //       trace("hmmmmm " + world.un.x);
       //       trace("what does left bound look like " + leftBound);

       //   }
     // }

    //  world.glob.soulLayer.addChild(world.land.display);
      world.glob.soulLayer.addChild(world.un.display);
     // world.glob.uiLayer.addChild(world.bomb.display);
     // world.glob.uiLayer.addChild(world.title.display);

      //newX += world.startX

      //newX = 500;

     // var newX = world.un.x;
     
     //TweenMax.to( world.glob, 0, { x: x });
      //     world.touch.x = world.cosmos.x * -1 + 642;
    //  trace(" new x " + time);
      
      //if (world.center == true) newX + 400;

   //   world.cosmos.x = world.un.x *= -1;

      if (world.land.content.updateLandscapeX == null) return;

     // trace("are u hitting this ??? ");

      world.land.content.updateLandscapeX( world.glob.x + 15000 );






  },

}