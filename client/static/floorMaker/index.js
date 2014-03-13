world = {
  
  name:"Corridor Of Doom",
  bounds:[],
  follow:false,
  allowControl:true,
  debug:false,


  awake:function( glob )  { 
  	world.glob          = glob; 
    glob.debug          = world.debug;
    art.desert          = glob.rockFile("floorMaker");
  },

  awakeComplete:function( glob ) {
   
    var toon;   
    toon = world.desert = glob.addRock( art.desert, glob.width * .5, glob.height * .5  ); 
    
  },

  
  update:function(){  

    
  },

}

