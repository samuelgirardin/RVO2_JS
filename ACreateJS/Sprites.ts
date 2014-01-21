/// <reference path="create/easeljs.d.ts" />
/// <reference path="Constants.ts" />

// Author : Samuel Girardin- http://www.visualiser.fr


class Sprites extends createjs.Bitmap {


    private animations: string[] = ["run", "idle"];
    private bitmapAnimation: createjs.Bitmap; 
    private animOn: boolean = false;

    private static nam: number = 0;

    constructor(bitmap: createjs.Bitmap, cX: number, cY: number) {

        super(bitmap.image);

        this.x = cX;
        this.y = cY;
        this.scaleX = this.scaleY = 1;
        this.regX = 16;
        this.regY = 16; 
        this.name = Sprites.nam.toString();;

       // var rand = Math.floor(Math.random() * 2);
      

      //  var handleMouse_bind = this.handleMouse.bind(this);
      //  this.addEventListener(Constants.MOUSE_DOWN, handleMouse_bind);

        Sprites.nam++;
    }


    private handleMouse(event): void {

        if (this.animOn) return;

        this.animOn = true;
        // rand = Math.floor(Math.random() * 2);
       
        
        var tween = createjs.Tween.get(this, { loop: false })
                         .to({ x: this.x, y: this.y - 180 }, 750, createjs.Ease.linear)
                         .to({ x: this.x, y: this.y + 180 }, 1500, createjs.Ease.linear)
                         .to({ x: this.x, y: this.y }, 750, createjs.Ease.linear);

    }

   

    public setSpritePosition(x: number, y: number) {

        this.x = x;
        this.y = y; 
    }

    public setScale(v: number): void {

        this.scaleX = this.scaleY = v; 
    }

    public getBitmapAnimation(): createjs.Bitmap {

        return this;
    }

}