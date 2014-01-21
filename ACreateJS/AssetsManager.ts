/// <reference path="create/easeljs.d.ts" />
/// <reference path="create/preloadjs.d.ts" />
/// <reference path="Constants.ts" />

// Author : Samuel Girardin- http://www.visualiser.fr


class AssetsManager extends createjs.Container {


    private assets: any[] = [];
    private manifest: any[];

    private label_filesDownload: createjs.Text;
    private label_percentDownload: createjs.Text;

    private counter_files: number = 0;
    private len_manifest: number = 0;

    //static assets

    public static array_bitmapAnimation: createjs.BitmapAnimation[] = [];
    public static array_jpg: createjs.Bitmap[] = [];


    constructor(manifest: any[]) {

        super();

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

    public startDownLoad(): void {


        var progress = this.handleProgress.bind(this);
        var complete = this.handleComplete.bind(this);
        var fileload = this.handleFileLoad.bind(this);
        var loader: createjs.LoadQueue = new createjs.LoadQueue();

        loader.addEventListener("fileload", fileload);
        loader.addEventListener("complete", complete);
        loader.addEventListener("progress", progress)

        loader.loadManifest(this.manifest);

    }





    private handleProgress(event) {

        this.label_percentDownload.text = "(" + (event.loaded * 100).toFixed(1) + " %)";
    }




    private handleFileLoad(event) {

        this.counter_files++;
        this.label_filesDownload.text = "Downloading " + this.counter_files + "/" + this.len_manifest;
        this.assets.push(event);

    }



    private handleComplete(event) {


        console.log("HandleComplete : ALl Files loaded ");


        this.removeChild(this.label_filesDownload);
        this.removeChild(this.label_percentDownload);


        // Handle preload results...
        for (var i = 0; i < this.assets.length; i++) {
            var item = this.assets[i]; //loader.getResult(id);
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
        result = null

        this.dispatchEvent(Constants.LOAD_COMPLETE, this);
        document.getElementById("loader").className = "";


    }




}