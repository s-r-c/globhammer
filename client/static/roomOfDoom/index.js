world = {
  
  name:"Corridor Of Doom",
  bounds:[ {x:0, y:500 ,w:1000 ,h:500 }  ],
  follow:false,
  allowControl:true,
  debug:true,

  awake:function( glob )  { 
  	world.glob             = glob; 
    glob.debug             = world.debug;
    art.frame              = glob.rockFile("frame");
    art.landscape          = glob.rockFile("landscape");
    art.caretaker          = glob.rockFile('caretaker');
    //art.door               = glob.rockFile("door");
    //art.heroIntro          = glob.rockFile('heroIntro' );
    
  
  },

  awakeComplete:function( glob ) {
   
    var toon;   
    toon = world.landscape    = glob.addRock( art.landscape,  glob.width * .5, glob.height * .5  ); 
    toon = world.caretaker    = glob.addRock( art.caretaker,  250 , 365  ); 

    //toon = world.door1        = glob.addRock( art.door,        250 , 365  ); 
    //toon = world.frame        = glob.addRock( art.frame,       glob.width * .5, glob.height * .5  );
    //toon = world.intro        = glob.addRock( art.heroIntro,   250, 540  );

    setTimeout( world.phase1, 3000 );

    glob.content.setUpPhysicsLayer(); 
   
    
  },

  phase1:function(){
      trace('phase1 ');
      world.door1.show = 'opening';
  },

  
  update:function(){  

    
  },

}

