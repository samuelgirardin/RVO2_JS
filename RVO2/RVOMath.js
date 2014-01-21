/// <reference path="KdTree.ts" />
/// <reference path="Vector2.ts" />
/// <reference path="Line.ts" />
/// <reference path="Agent.ts" />
/// <reference path="Obstacle.ts" />
/// <reference path="AgentTreeNode.ts" />
/// <reference path="ObstacleTreeNode.ts" />
var RVOMath = (function () {
    function RVOMath() {
    }
    RVOMath.sqr = function (p) {
        return p * p;
        // return Math.pow(p, 2);
    };
    RVOMath.RVO_EPSILON = 0.0001;
    return RVOMath;
})();
//# sourceMappingURL=RVOMath.js.map
