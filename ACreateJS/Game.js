/// <reference path="create/easeljs.d.ts" />
/// <reference path="create/preloadjs.d.ts" />
/// <reference path="AssetsManager.ts" />
/// <reference path="Constants.ts" />
/// <reference path="Sprites.ts" />
/// <reference path="../RVO2/Simulator.ts" />
/// <reference path="../RVO2/Vector2.ts" />
// Author : Samuel Girardin- http://www.visualiser.fr
var Game = (function () {
    function Game(manifest) {
        this.sps = [];
        this.xx = 0;
        this.yy = 0;
        // rvo stuff
        this.rvo_is_ini = false;
        this.goals = [];
        this.na = 55;
        this.hh = 860;
        this.ww = 1100;
        // create stage and point it to the canvas:
        this.canvas = document.getElementById("canvas");

        //check to see if we are running in a browser with touch support
        this.stage = new createjs.Stage(this.canvas);
        this.stage.autoClear = true;

        // enable touch interactions if supported on the current device:
        createjs.Touch.enable(this.stage);

        // enabled mouse over / out events
        this.stage.enableMouseOver(5);

        // tick evvent
        createjs.Ticker.setFPS(60);

        // enterframeEvent
        var tick_bind = this.tick.bind(this);
        createjs.Ticker.addEventListener("tick", tick_bind);

        this.container = new createjs.Container();
        this.stage.addChild(this.container);

        // create assetManagerObject as a container to display label and deal with the queueManager
        this.assetsManagerContainer = new AssetsManager(manifest);
        this.stage.addChild(this.assetsManagerContainer);
        var allAssetsLoaded_bind = this.allAssetsLoaded.bind(this);
        this.assetsManagerContainer.addEventListener(Constants.LOAD_COMPLETE, allAssetsLoaded_bind);
        this.assetsManagerContainer.startDownLoad();

        this.label_fps = new createjs.Text("--", "bold 16px Arial", "#CCC");

        this.label_fps.x = 824;
        this.label_fps.y = 140;
    }
    Game.prototype.allAssetsLoaded = function (event) {
        console.log("All Assets Loaded !");
        event.target.removeEventListener(Constants.LOAD_COMPLETE, this.allAssetsLoaded);

        /* Create a new simulator instance. */
        this.sim = new Simulator();

        /* Set up the scenario. */
        this.setupScenario(this.sim);

        //this.container.addEventListener(
        var handleMouse_bind = this.handleMouse.bind(this);
        this.container.addEventListener(Constants.MOUSE_DOWN, handleMouse_bind);

        //add bckground
        this.container.addChild(AssetsManager.array_jpg[0]);

        this.container.addChild(this.label_fps);

        for (var j = 1; j < 4; j++) {
            for (var i = 0; i < this.na; i++) {
                var v = this.sim.getAgentPosition(i);
                if (j == 1)
                    var sprite = new Sprites(AssetsManager.array_jpg[1].clone(), v.x, v.y);
                if (j == 2)
                    var sprite = new Sprites(AssetsManager.array_jpg[2].clone(), v.x, v.y);
                if (j == 3)
                    var sprite = new Sprites(AssetsManager.array_jpg[3].clone(), v.x, v.y);
                if (j == 1)
                    sprite.setScale(.7);
                this.sps.push(sprite);
                this.container.addChild(sprite.getBitmapAnimation());
            }
        }

        this.rvo_is_ini = true;
    };

    Game.prototype.handleMouse = function (event) {
        this.xx = event.stageX;
        this.yy = event.stageY;
    };

    Game.prototype.setupScenario = function (sim) {
        console.log("setupScenario");

        /* Specify the global time step of the simulation. */
        sim.setTimeStep(1.75);

        /* Specify the default parameters for agents that are subsequently added. */
        sim.setAgentDefaults(125, 50, 100, 0, 16, 1);

        /*
        * Add agents, specifying their start position, and store their goals on the
        * opposite side of the environment.
        */
        var n = this.na;
        var c = 0;

        for (var j = 1; j < 4; j++) {
            for (var i = 0; i < n; i++) {
                //add agent & his start position
                var v = new Vector2(Math.cos(i * 2 * Math.PI / n), Math.sin(i * 2 * Math.PI / n));

                if (j == 1) {
                    sim.addAgent(v.mul_k(200)); /*sim.setAgentMaxSpeed(c,1)*/ 
                }
                if (j == 2) {
                    sim.addAgent(v.mul_k(330)); /*sim.setAgentMaxSpeed(c, 1)*/ 
                }
                if (j == 3) {
                    sim.addAgent(v.mul_k(410)); /*sim.setAgentMaxSpeed(c, 1) */ 
                }

                if (j == 1)
                    sim.setAgentRadius(i, 12);

                sim.setAgentMaxSpeed(c, .5 + Math.random() * 1);

                //store the goal to the opposite
                // var v = sim.getAgentPosition(c).moinsSelf();
                var v = sim.getAgentPosition(c);
                this.goals.push(v);

                // this.goals[i] = new Vector2(500, 0);
                c++;
            }
        }

        /*
        * Add (polygonal) obstacles, specifying their vertices in counterclockwise
        * order.
        */
        var obstacle1 = [];
        var obstacle2 = [];
        var obstacle3 = [];
        var obstacle4 = [];

        obstacle1.push(new Vector2(50, 300));
        obstacle1.push(new Vector2(-50, 300));
        obstacle1.push(new Vector2(-50, 50.0));
        obstacle1.push(new Vector2(50, 50.0));

        obstacle2.push(new Vector2(50, -50));
        obstacle2.push(new Vector2(-50, -50));
        obstacle2.push(new Vector2(-50, -300));
        obstacle2.push(new Vector2(50, -300));

        obstacle3.push(new Vector2(this.ww / 2, -this.hh / 2));
        obstacle3.push(new Vector2(-this.ww / 2, -this.hh / 2));
        obstacle3.push(new Vector2(-this.ww / 2, this.hh / 2));
        obstacle3.push(new Vector2(this.ww / 2, this.hh / 2));

        sim.addObstacle(obstacle1);
        sim.addObstacle(obstacle2);
        sim.addObstacle(obstacle3);
        sim.addObstacle(obstacle4);

        /* Process the obstacles so that they are accounted  or in the simulation. */
        sim.processObstacles();
    };

    Game.prototype.setPreferredVelocities = function (sim) {
        for (var i = 0; i < this.na * 3; i++) {
            if (i < this.na)
                this.goals[i] = new Vector2(this.xx - this.ww / 2, this.yy - this.hh / 2);
            // else
            // this.goals[i] = new Vector2(this.xx - 500, this.yy - 300).moinsSelf();
        }

        for (var i = 0; i < sim.getNumAgents(); i++) {
            var goalVector = this.goals[i].moins(sim.getAgentPosition(i));

            if (Vector2.absSq(goalVector) > 1) {
                goalVector = Vector2.normalize(goalVector);
            }

            //goalVector = new Vector2(.7, .7);
            sim.setAgentPrefVelocity(i, goalVector);
        }
        /*  for (var  i = 0; i < sim.getNumAgents(); ++i) {
        
        var goalVector = this.goals[i].moins(sim.getAgentPosition(i)) ;
        
        if (Vector2.absSq(goalVector) > 1.0) {
        goalVector = Vector2.normalize(goalVector);
        }
        
        sim.setAgentPrefVelocity(i, goalVector);
        }*/
    };

    Game.prototype.updateSpritePosition = function () {
        for (var i = 0; i < this.sim.getNumAgents(); i++) {
            var v = this.sim.getAgentPosition(i);
            this.sps[i].setSpritePosition(v.x + this.ww / 2, v.y + this.hh / 2);
            this.sps[i].rotation = this.sim.getAgentOrientation(i);
        }
        /*  for (var i = 0 ; i < this.sim.getOrca(0).length ; ++i) {
        
        var v: Vector2 = this.sim.getOrca(0)[i].direction;
        var w: Vector2 = this.sim.getOrca(0)[i].point;
        console.log(v.x, v.y, w.x, w.y);
        }*/
        /*   var v: Vector2 = new Vector2(1.1975, 8.1972);
        var w: Vector2 = new Vector2(2.1975, 9.1972);
        
        console.log("inline Vector2 operator-(const Vector2 &vector) const");
        var res: Vector2 = v.moins(w);
        console.log(res.x_, res.y_); */
    };

    Game.prototype.do_step = function () {
        if (!this.rvo_is_ini)
            return;

        this.updateSpritePosition();

        this.setPreferredVelocities(this.sim);

        this.sim.doStep();
        //console.log("doStep");
    };

    Game.prototype.tick = function (event) {
        this.do_step();
        this.label_fps.text = Math.round(createjs.Ticker.getMeasuredFPS());
        this.stage.update(event);
    };
    return Game;
})();
//# sourceMappingURL=Game.js.map
