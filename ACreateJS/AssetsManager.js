/// <reference path="create/easeljs.d.ts" />
/// <reference path="create/preloadjs.d.ts" />
/// <reference path="Constants.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
// Author : Samuel Girardin- http://www.visualiser.fr
var AssetsManager = (function (_super) {
    __extends(AssetsManager, _super);
    function AssetsManager(manifest) {
        _super.call(this);
        this.assets = [];
        this.counter_files = 0;
        this.len_manifest = 0;

        document.getElementById("loader").className = "loader";
        createjs.EventDispatcher.initialize(AssetsManager.prototype);

        console.log("AssetsManager constructor");
        this.manifest = manifest;
        this.len_manifest = manifest.length;

        this.label_filesDownload = new createjs.Text("Downloading", "bold 16px Arial", "#000000");
        this.label_filesDownload.textAlign = "center";
        this.label_filesDownload.x = 435;
        this.label_filesDownload.y = 550;
        this.addChild(this.label_filesDownload);

        this.label_percentDownload = new createjs.Text("(0 %)", "bold 16px Arial", "#000000");
        this.label_percentDownload.textAlign = "center";
        this.label_percentDownload.x = 435;
        this.label_percentDownload.y = 570;
        this.addChild(this.label_percentDownload);
    }
    AssetsManager.prototype.startDownLoad = function () {
        var progress = this.handleProgress.bind(this);
        var complete = this.handleComplete.bind(this);
        var fileload = this.handleFileLoad.bind(this);
        var loader = new createjs.LoadQueue();

        loader.addEventListener("fileload", fileload);
        loader.addEventListener("complete", complete);
        loader.addEventListener("progress", progress);

        loader.loadManifest(this.manifest);
    };

    AssetsManager.prototype.handleProgress = function (event) {
        this.label_percentDownload.text = "(" + (event.loaded * 100).toFixed(1) + " %)";
    };

    AssetsManager.prototype.handleFileLoad = function (event) {
        this.counter_files++;
        this.label_filesDownload.text = "Downloading " + this.counter_files + "/" + this.len_manifest;
        this.assets.push(event);
    };

    AssetsManager.prototype.handleComplete = function (event) {
        console.log("HandleComplete : ALl Files loaded ");

        this.removeChild(this.label_filesDownload);
        this.removeChild(this.label_percentDownload);

        for (var i = 0; i < this.assets.length; i++) {
            var item = this.assets[i];
            var id = item.item.id;
            var result = item.result;

            switch (id) {
                case "j0":
                    var spriteSheet = new createjs.SpriteSheet({ "animations": { "run": [0, 31], "fall": [32, 45], "no": [55, 75], "idle": [76], "diying": [80, 113] }, "images": [result], "frames": { "height": 64, "width": 64, "regX": 32, "regY": 32, "count": 113 } });

                    //  spriteSheet.getAnimation("run").frequency = 3;
                    var bmpAnimation = new createjs.BitmapAnimation(spriteSheet);
                    AssetsManager.array_bitmapAnimation[0] = bmpAnimation;

                    break;
                case "backj":
                    AssetsManager.array_jpg[0] = new createjs.Bitmap(result);
                    break;
                case "z1":
                    AssetsManager.array_jpg[1] = new createjs.Bitmap(result);
                    break;
                case "z2":
                    AssetsManager.array_jpg[2] = new createjs.Bitmap(result);
                    break;
                case "z3":
                    AssetsManager.array_jpg[3] = new createjs.Bitmap(result);
                    break;
            }
        }

        //free Mem ?
        this.assets = null;
        item = null;
        result = null;

        this.dispatchEvent(Constants.LOAD_COMPLETE, this);
        document.getElementById("loader").className = "";
    };
    AssetsManager.array_bitmapAnimation = [];
    AssetsManager.array_jpg = [];
    return AssetsManager;
})(createjs.Container);
//# sourceMappingURL=AssetsManager.js.map
