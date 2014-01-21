/// <reference path="create/easeljs.d.ts" />
/// <reference path="Constants.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
// Author : Samuel Girardin- http://www.visualiser.fr
var Sprites = (function (_super) {
    __extends(Sprites, _super);
    function Sprites(bitmap, cX, cY) {
        _super.call(this, bitmap.image);
        this.animations = ["run", "idle"];
        this.animOn = false;

        this.x = cX;
        this.y = cY;
        this.scaleX = this.scaleY = 1;
        this.regX = 16;
        this.regY = 16;
        this.name = Sprites.nam.toString();
        ;

        // var rand = Math.floor(Math.random() * 2);
        //  var handleMouse_bind = this.handleMouse.bind(this);
        //  this.addEventListener(Constants.MOUSE_DOWN, handleMouse_bind);
        Sprites.nam++;
    }
    Sprites.prototype.handleMouse = function (event) {
        if (this.animOn)
            return;

        this.animOn = true;

        // rand = Math.floor(Math.random() * 2);
        var tween = createjs.Tween.get(this, { loop: false }).to({ x: this.x, y: this.y - 180 }, 750, createjs.Ease.linear).to({ x: this.x, y: this.y + 180 }, 1500, createjs.Ease.linear).to({ x: this.x, y: this.y }, 750, createjs.Ease.linear);
    };

    Sprites.prototype.setSpritePosition = function (x, y) {
        this.x = x;
        this.y = y;
    };

    Sprites.prototype.setScale = function (v) {
        this.scaleX = this.scaleY = v;
    };

    Sprites.prototype.getBitmapAnimation = function () {
        return this;
    };
    Sprites.nam = 0;
    return Sprites;
})(createjs.Bitmap);
//# sourceMappingURL=Sprites.js.map
