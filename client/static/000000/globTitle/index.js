soul = {

    name: "Template",
    content: "Chariot",
    toonList: [{ viz: 1, id: "idle", speed: .3 }],

    awake: function (rock) {
        var glob = rock.glob;
        rock.display.alpha = 0;

        var delay = 5;
        var offSet = "+=" + delay;
        var duration = 2;

        var tl = new TimelineLite();
        tl.to(rock.display, 2, { alpha: 1 }, offSet);
        tl.to(rock.display, 2, { alpha: 0 }, offSet);
        tl.play();

    }

}