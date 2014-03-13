soul = {

  name:"Door",
  content:"Chariot",
  toonList:[    
            { viz:0, id:'closed', 	src:"idle",  speed:1, frames:[0]  },
            { viz:0, id:'opening', 	src:"idle",  speed:1, frames:[0,1,2,3,4,5,6,7,8,9, 10], complete:'open'  },
            { viz:0, id:'open', 	src:"idle",  speed:1, frames:[10], loop:'false'  },
            { viz:1, id:'closing', 	src:"idle",  speed:1, frames:[10,11,12,13,14,15,16,17,18,19,20] , complete:'closed'  },






           ],

}