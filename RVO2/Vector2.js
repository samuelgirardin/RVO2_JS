/// <reference path="RVOMath.ts" />
/// <reference path="KdTree.ts" />
/// <reference path="Line.ts" />
/// <reference path="Agent.ts" />
/// <reference path="Obstacle.ts" />
/// <reference path="AgentTreeNode.ts" />
/// <reference path="ObstacleTreeNode.ts" />
var Vector2 = (function () {
    function Vector2(x, y) {
        this.x = x;
        this.y = y;
    }
    Vector2.prototype.moins = function (v) {
        return new Vector2(this.x - v.x, this.y - v.y);
    };

    Vector2.prototype.moinsSelf = function () {
        return new Vector2(-this.x, -this.y);
    };

    Vector2.prototype.plus = function (v) {
        return new Vector2(this.x + v.x, this.y + v.y);
    };

    Vector2.prototype.mul = function (v) {
        return this.x * v.x + this.y * v.y;
    };

    Vector2.prototype.mul_k = function (k) {
        return new Vector2(this.x * k, this.y * k);
    };

    Vector2.prototype.div_k = function (k) {
        var s = 1 / k;
        return new Vector2(this.x * s, this.y * s);
    };

    Vector2.absSq = function (v) {
        return v.mul(v);
    };

    Vector2.abs = function (v) {
        return Math.sqrt(v.mul(v));
    };

    Vector2.det = function (v1, v2) {
        return v1.x * v2.y - v1.y * v2.x;
    };

    Vector2.normalize = function (v) {
        return v.div_k(Vector2.abs(v));
    };

    Vector2.leftOf = function (a, b, c) {
        return Vector2.det(a.moins(c), b.moins(a));
    };

    Vector2.distSqPointLineSegment = function (a, b, c) {
        var r = c.moins(a).mul(b.moins(a)) / Vector2.absSq(b.moins(a));

        if (r < 0) {
            return Vector2.absSq(c.moins(a));
        } else if (r > 1) {
            return Vector2.absSq(c.moins(b));
        } else {
            return Vector2.absSq(c.moins(a.plus(b.moins(a).mul_k(r))));
        }
    };
    return Vector2;
})();
//# sourceMappingURL=Vector2.js.map
