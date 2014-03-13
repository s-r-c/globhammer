
var LetterBox = function ($glob) {

    //Create the vars
    var self = require("/globHammer/ui/UI")($glob);

    self.awake = function () {

        var size = 150;

        var top = new PIXI.Graphics();
        top.beginFill(0x000000);
        top.drawRect(0, 0, self.glob.width, size);
        self.display.addChild(top);

        var bottom = new PIXI.Graphics();
        bottom.beginFill(0x000000);
        bottom.drawRect(0, 0, self.glob.width, size);
        self.display.addChild(bottom);

        var numbersGame = self.glob.height - (size);

        bottom.position.y = numbersGame;
    }

    self.awake();
    return self;
}


exports = module.exports = LetterBox;