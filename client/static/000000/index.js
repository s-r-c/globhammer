world = {
  
  name:" Title 1",

   bounds: [
          {x:-2000, w:1100,       y:520, h:520},
          {x:1100, w:1800,        y:520, h:20},
          {x:1800, w:2000,        y:20, h:20},
          ],

  awake:function( glob )  {  
    glob.debug          = false;
    world.glob          = glob;
    art.title           = glob.rockFile('globTitle');
    art.space           = glob.rockFile('template');
  },

  awakeComplete:function( glob ) {
    var glob = world.glob;
    var toon;
    
    //glob.uiLayer.addChild(toon.display);

    toon = world.space = glob.addRock( art.space,  961, 540 );  
    toon = world.title = glob.addRock(art.title, 960, 540);

    trace("figure this shit out ");

    world.phase1();
  },

  phase1: function () {
      setTimeout(world.phase2, 2500);
  },

  phase2:function(){
      //GLOB.glob.world = GLOB.src + 'title2/title2.js';
  },
 
  update:function(){   },

}