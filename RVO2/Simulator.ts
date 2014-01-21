
/// <reference path="KdTree.ts" />
/// <reference path="Vector2.ts" />
/// <reference path="Line.ts" />
/// <reference path="Agent.ts" />
/// <reference path="Obstacle.ts" />
/// <reference path="AgentTreeNode.ts" />
/// <reference path="ObstacleTreeNode.ts" />


class Simulator {

   
    defaultAgent_: Agent;
    agents_: Agent[];

    time_: number = 0;
    timeStep_: number;
   
    obstacles_:Obstacle[];
    kdTree_: KdTree;
  
    static _instance: Simulator;
  

    constructor() {

        this.agents_ = [];
        this.obstacles_ = [];
        this.time_ = 0;
        this.defaultAgent_ = null;
        this.kdTree_ = new KdTree();
        this.timeStep_ = 1;
       
        Simulator._instance = this; 
    }

    public static Instance(): Simulator {
       
        return Simulator._instance;
    }

    public clear() {

    }

    public doStep() {


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
    }

    public processObstacles() {

        this.kdTree_.buildObstacleTree();
    }

    public queryVisibility(point1 : Vector2 , point2:Vector2, radius:number) 
        {
            return this.kdTree_.queryVisibility(point1, point2, radius);
        }

    public addObstacle(vertices: Vector2[]): number {

        if (vertices.length < 2) {
            return -1;
        }

        var obstacleNo = this.obstacles_.length; 

        for (var i = 0; i < vertices.length; ++i) {
            var obstacle:Obstacle = new Obstacle();
            obstacle.point_ = vertices[i];

            if (i != 0) {
                obstacle.prevObstacle_ = this.obstacles_[this.obstacles_.length - 1]; 
                obstacle.prevObstacle_.nextObstacle_ = obstacle;
            }

            if (i == vertices.length - 1) {
                obstacle.nextObstacle_ = this.obstacles_[obstacleNo];
                obstacle.nextObstacle_ .prevObstacle_ = obstacle;
            }

            obstacle.unitDir_ = Vector2.normalize(vertices[(i == vertices.length - 1 ? 0 : i + 1)].moins( vertices[i]));

            if (vertices.length == 2) {
                obstacle.isConvex_ = true;
            }
            else {
                obstacle.isConvex_ = (Vector2.leftOf(vertices[(i == 0 ? vertices.length - 1 : i - 1)], vertices[i], vertices[(i == vertices.length - 1 ? 0 : i + 1)]) >= 0);
            }

            obstacle.id_ = this.obstacles_.length;

            this.obstacles_.push(obstacle);
        }

        return obstacleNo;
    }


    

    public addAgent(position:Vector2)
        {
            if (this.defaultAgent_ == null) {
                return -1;
            }

            var  agent:Agent = new Agent();

            agent.position_ = position;
            agent.maxNeighbors_ = this.defaultAgent_.maxNeighbors_;
            agent.maxSpeed_ = this.defaultAgent_.maxSpeed_;
            agent.neighborDist_ =this. defaultAgent_.neighborDist_;
            agent.radius_ = this.defaultAgent_.radius_;
            agent.timeHorizon_ = this.defaultAgent_.timeHorizon_;
            agent.timeHorizonObst_ =this. defaultAgent_.timeHorizonObst_;
            agent.velocity_ = this.defaultAgent_.velocity_;

            agent.id_ = this.agents_.length;

            this.agents_.push(agent);

            return this.agents_.length - 1;

        }

    public setAgentDefaults(neighborDist:number,  maxNeighbors:number,  timeHorizon:number, timeHorizonObst:number, radius:number,  maxSpeed:number, velocity:Vector2 = new Vector2(0,0)):void
    {
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
    }

    public setAgentPrefVelocity(agentNo : number, prefVelocity:Vector2)
    {
        this.agents_[agentNo].prefVelocity_ = prefVelocity;
       // console.log(prefVelocity.x_, prefVelocity.y_); 
    }

    public setTimeStep(v: number): void
    {
        this.timeStep_ = v; 
    }

    public setAgentMaxSpeed(agentNo:number, maxSpeed:number)
    {
        this.agents_[agentNo].maxSpeed_ = maxSpeed;
    }

    public setAgentRadius(agentNo: number, radius: number) {
        this.agents_[agentNo].radius_= radius;
    }

    public getAgentOrientation(agentNo: number): number {

        return this.agents_[agentNo].orientation_; 
    }

    public getOrca(agentNo: number): Line[] {

        return this.agents_[agentNo].orcaLines_; 
    }


    public getAgentPositionScreen(agentNo:number):Vector2
    {
        return this.agents_[agentNo].positionScreen_;
    }

    public getAgentPosition(agentNo: number): Vector2 {

        return this.agents_[agentNo].position_;
    }

    public getNumAgents():number
    {
        return this.agents_.length; 
    }

    public getAgentRadius(agentNo:number):number
    {
        return this.agents_[agentNo].radius_;
    }
     
    

}