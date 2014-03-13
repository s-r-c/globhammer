world = {
  
  name:"Minerva Control",

bounds:[ {x:0, y:700 ,w:1000 ,h:700 }  ],

  follow:false,
  allowControl:true,
  debug:false,

  awake:function( glob )  {  
    glob.debug          = world.debug;

    var srcFolder     = 'ui/title/';
    art.logo          = srcFolder + 'logo.png';
    art.star          = srcFolder + 'star.png';
    art.skull         = srcFolder + 'skull.png';
    art.red           = srcFolder + 'red.png';
    art.blue          = srcFolder + 'blue.png';
    art.green         = srcFolder + 'green.png';
    
    world.glob          = glob;
    art.desert          = glob.rockFile("landscape");

    art.hero            = glob.rockFile('hero', '0-index');
    
    art.heroForward     = glob.rockFile('hero', 'moveForward');
    art.heroStrike      = glob.rockFile('hero', 'strike');
    //art.heroBackward    = glob.rockFile('hero', 'moveBackward');
    //art.heroJump        = glob.rockFile('hero', 'jump');
   
    //art.heroBonesaw     = glob.rockFile('hero', 'bonesaw');
    //art.heroChange      = glob.rockFile('hero', 'change');
   
   art.roach           = glob.rockFile('giantRoach' );
   art.roachHit        = glob.rockFile('giantRoach', 'hit');
    
   
  },

  awakeComplete:function( glob ) {
    var glob = world.glob;
    var toon;   
    toon = world.desert = glob.addRock( art.desert, glob.width, 0  );
    
   // var max = 30;
   // for ( var i = 0; i < max; i++ ){

     // toon = glob.addRock( art.roach, 600 * 0 + 600, 400 ); 

    //}

    toon = world.hero = glob.addRock( art.hero, 0, 0 );   

    
  },

  
  update:function(){  

    if ( world.hero == null ) return;
    if ( world.desert == null ) return;
    
    if (world.desert.content.updateLandscapeX == null) return;
    world.desert.content.updateLandscapeX( world.glob.x + 15000 );

    if ( world.follow == true ) 
   {
   var pos = world.hero.x - world.glob.width * .25;
   TweenMax.to( world.glob, 0, { x: pos, delay:0 });
   }
    
  },

}

