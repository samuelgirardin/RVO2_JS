/// <reference path="KdTree.ts" />
/// <reference path="Vector2.ts" />
/// <reference path="Line.ts" />
/// <reference path="Agent.ts" />
/// <reference path="Obstacle.ts" />
/// <reference path="AgentTreeNode.ts" />
/// <reference path="ObstacleTreeNode.ts" />
var Simulator = (function () {
    function Simulator() {
        this.time_ = 0;
        this.agents_ = [];
        this.obstacles_ = [];
        this.time_ = 0;
        this.defaultAgent_ = null;
        this.kdTree_ = new KdTree();
        this.timeStep_ = 1;

        Simulator._instance = this;
    }
    Simulator.Instance = function () {
        return Simulator._instance;
    };

    Simulator.prototype.clear = function () {
    };

    Simulator.prototype.doStep = function () {
        // console.log("ds la simu");
        this.kdTree_.buildAgentTree();

        for (var i = 0; i < this.getNumAgents(); ++i) {
            this.agents_[i].computeNeighbors();
            this.agents_[i].computeNewVelocity();
        }
        for (var i = 0; i < this.getNumAgents(); ++i) {
            this.agents_[i].update();
        }

        this.time_ += this.timeStep_;
    };

    Simulator.prototype.processObstacles = function () {
        this.kdTree_.buildObstacleTree();
    };

    Simulator.prototype.queryVisibility = function (point1, point2, radius) {
        return this.kdTree_.queryVisibility(point1, point2, radius);
    };

    Simulator.prototype.addObstacle = function (vertices) {
        if (vertices.length < 2) {
            return -1;
        }

        var obstacleNo = this.obstacles_.length;

        for (var i = 0; i < vertices.length; ++i) {
            var obstacle = new Obstacle();
            obstacle.point_ = vertices[i];

            if (i != 0) {
                obstacle.prevObstacle_ = this.obstacles_[this.obstacles_.length - 1];
                obstacle.prevObstacle_.nextObstacle_ = obstacle;
            }

            if (i == vertices.length - 1) {
                obstacle.nextObstacle_ = this.obstacles_[obstacleNo];
                obstacle.nextObstacle_.prevObstacle_ = obstacle;
            }

            obstacle.unitDir_ = Vector2.normalize(vertices[(i == vertices.length - 1 ? 0 : i + 1)].moins(vertices[i]));

            if (vertices.length == 2) {
                obstacle.isConvex_ = true;
            } else {
                obstacle.isConvex_ = (Vector2.leftOf(vertices[(i == 0 ? vertices.length - 1 : i - 1)], vertices[i], vertices[(i == vertices.length - 1 ? 0 : i + 1)]) >= 0);
            }

            obstacle.id_ = this.obstacles_.length;

            this.obstacles_.push(obstacle);
        }

        return obstacleNo;
    };

    Simulator.prototype.addAgent = function (position) {
        if (this.defaultAgent_ == null) {
            return -1;
        }

        var agent = new Agent();

        agent.position_ = position;
        agent.maxNeighbors_ = this.defaultAgent_.maxNeighbors_;
        agent.maxSpeed_ = this.defaultAgent_.maxSpeed_;
        agent.neighborDist_ = this.defaultAgent_.neighborDist_;
        agent.radius_ = this.defaultAgent_.radius_;
        agent.timeHorizon_ = this.defaultAgent_.timeHorizon_;
        agent.timeHorizonObst_ = this.defaultAgent_.timeHorizonObst_;
        agent.velocity_ = this.defaultAgent_.velocity_;

        agent.id_ = this.agents_.length;

        this.agents_.push(agent);

        return this.agents_.length - 1;
    };

    Simulator.prototype.setAgentDefaults = function (neighborDist, maxNeighbors, timeHorizon, timeHorizonObst, radius, maxSpeed, velocity) {
        if (typeof velocity === "undefined") { velocity = new Vector2(0, 0); }
        if (this.defaultAgent_ == null) {
            this.defaultAgent_ = new Agent();
        }

        this.defaultAgent_.maxNeighbors_ = maxNeighbors;
        this.defaultAgent_.maxSpeed_ = maxSpeed;
        this.defaultAgent_.neighborDist_ = neighborDist;
        this.defaultAgent_.radius_ = radius;
        this.defaultAgent_.timeHorizon_ = timeHorizon;
        this.defaultAgent_.timeHorizonObst_ = timeHorizonObst;
        this.defaultAgent_.velocity_ = velocity;
    };

    Simulator.prototype.setAgentPrefVelocity = function (agentNo, prefVelocity) {
        this.agents_[agentNo].prefVelocity_ = prefVelocity;
        // console.log(prefVelocity.x_, prefVelocity.y_);
    };

    Simulator.prototype.setTimeStep = function (v) {
        this.timeStep_ = v;
    };

    Simulator.prototype.setAgentMaxSpeed = function (agentNo, maxSpeed) {
        this.agents_[agentNo].maxSpeed_ = maxSpeed;
    };

    Simulator.prototype.setAgentRadius = function (agentNo, radius) {
        this.agents_[agentNo].radius_ = radius;
    };

    Simulator.prototype.getAgentOrientation = function (agentNo) {
        return this.agents_[agentNo].orientation_;
    };

    Simulator.prototype.getOrca = function (agentNo) {
        return this.agents_[agentNo].orcaLines_;
    };

    Simulator.prototype.getAgentPositionScreen = function (agentNo) {
        return this.agents_[agentNo].positionScreen_;
    };

    Simulator.prototype.getAgentPosition = function (agentNo) {
        return this.agents_[agentNo].position_;
    };

    Simulator.prototype.getNumAgents = function () {
        return this.agents_.length;
    };

    Simulator.prototype.getAgentRadius = function (agentNo) {
        return this.agents_[agentNo].radius_;
    };
    return Simulator;
})();
//# sourceMappingURL=Simulator.js.map
