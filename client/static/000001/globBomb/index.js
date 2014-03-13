soul = {

  name:"globBomb",
  content:"Chariot",
  toonList: [
      { viz: 1, id: "idle", src: 'idle', speed: 1,  frames: [ 0 ] },
      { viz: 0, id: "trigger", src: 'idle', speed:1, complete: 'trap' },
      { viz: 0, id: "trap", src: 'idle', speed: 1, loop: true, frames: [39, 38, 37, 36, 35,34,33,32,31,30,29,28,27,,27,28,29,30,31,32 ] }
      ],

      trigger: function (rock) {
          trace("bombs away ");
          rock.show = 'trigger';
      }


}