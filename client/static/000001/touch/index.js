soul = {

  name:"Influence",
  content:"ChariotPhysics",
  toonList: [
                { viz: 1, id: "idle", src:'idle', speed: .3, frames: [0]      },
                { viz: 0, id: "grow", src:'idle', speed: .3, complete:'idle'  },
  ],

  passThru: function (rockA, rockB) {
      trace("just passing throuh ");
  },

  collide: function (rockA, rockB) {
      trace("collide throuh ");
  },

}