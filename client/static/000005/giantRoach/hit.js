soul = {

  name:"Giant Roach Hurt",
  content:"Chariot",
  toonList:[    
            { viz:1, id:"idle",			  	speed:.5  },
            { viz:0, id:"hit",          speed:.5, complete:'idle'  }
           ],


  awake:function( rock ){ },

  featureComplete:function( rock ){
  		//trace("feature complete " + rock );
  		rock.addEventListener( rock.event.WOUND_BRUISE, soul.startAction );
  },

  startAction:function( rock ){
  		//trace("show me the money");
      soul.rockSelf.show = 'hit';
  },

  execute:function( rock ){

      rock.x = soul.rock.x;
      rock.y = soul.rock.y;

   },


}