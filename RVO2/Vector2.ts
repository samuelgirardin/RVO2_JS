

/// <reference path="RVOMath.ts" />

/// <reference path="KdTree.ts" />

/// <reference path="Line.ts" />
/// <reference path="Agent.ts" />
/// <reference path="Obstacle.ts" />
/// <reference path="AgentTreeNode.ts" />
/// <reference path="ObstacleTreeNode.ts" />
class Vector2 {


   

    x: number;
    y: number;

    constructor(x: number, y: number) {       

        this.x = x;
        this.y = y;       

    }

   


    public moins(v: Vector2): Vector2 {
        return new Vector2(this.x - v.x, this.y - v.y);
    }

    public moinsSelf(): Vector2 {
        return new Vector2(-this.x , -this.y);
    }

    public plus(v: Vector2): Vector2 {
        return new Vector2(this.x + v.x, this.y + v.y); 
    }

    public mul(v: Vector2): number {
        return this.x * v.x + this.y * v.y;

    }    

    public mul_k(k: number): Vector2 {
        return new Vector2(this.x * k, this.y * k);
    }

    public div_k(k: number): Vector2 {
        var s: number = 1 / k;
        return new Vector2(this.x * s, this.y * s);
    }

   

    public static absSq(v: Vector2): number {

        return v.mul(v); 
    }

    public static  abs(v: Vector2): number {

        return Math.sqrt(v.mul(v));
    }

    public static det(v1: Vector2, v2: Vector2): number {

        return v1.x * v2.y - v1.y * v2.x;
    }

    public static normalize(v: Vector2):Vector2 {

        return v.div_k(Vector2. abs(v));

    }

    public static leftOf(a: Vector2, b: Vector2, c: Vector2): number {

        return Vector2. det(a.moins(c), b.moins(a));
    }

    public static distSqPointLineSegment(a: Vector2, b: Vector2, c: Vector2): number {

        var r: number = c.moins(a).mul(b.moins(a)) / Vector2. absSq(b.moins(a));

        if (r < 0) {
            return Vector2.absSq(c.moins(a));
        }
        else if (r > 1) {
            return Vector2.absSq(c.moins(b));
        }
        else {
            return Vector2.absSq(c.moins(a.plus(b.moins(a).mul_k(r))));
              

        }
    }



    

    
}