soul = {

    name:"untitled",
    content:"ChariotPhysics",
    toonList: [
        { viz: 1, id: "start", src:'rebirth', speed: .13, loop: false, frames: [ 0 ] } ,

        { viz: 0, id: "rebirth", src:'rebirth', speed: .13, complete:'mid', frames: [0,0,0,0,0] },
    
        { viz: 0, id: "mid", src:'rebirth', speed: .13, complete:'mid1', frames: [0, 1, 2, 3,3,3, 4, 4, 4,  4, 4, 4, 4,  4,  5, 5, 5,5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,17 ] },
        { viz: 0, x: -40, y: -70, id: "mid1", src: 'rebirth', speed: .13, complete: 'mid2', frames: [20, 20, 20, 20, 20] },
        { viz: 0, x: -40, y: -70, id: "mid2", src: 'rebirth', speed: .43, complete: 'mid3', frames: [20, 21, 22, 22, 22, 22, 22, 22] },
        { viz: 0, x:-40, y:-70, id: "mid3", src: 'rebirth', speed: .13, complete: 'mid4', frames: [  22,22,21, 20] },
        { viz: 0, x: -40, y: -70, id: "mid4", src: 'rebirth', speed: .43, complete: 'turn', frames: [20, 20, 20, 20, 20] },
        { viz: 0, x: 10, y: -10, id: 'turn', speed: .13, loop: false },

        { viz: 0, x: 10, y: -10, id: 'walkRight', speed: .13  }


    ],



    walk: function (rock) {
    	rock.core.body.vx         = -50;
    	rock.show = "walkRight";
    }

}



