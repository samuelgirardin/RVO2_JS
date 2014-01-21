/// <reference path="Vector2.ts" />
/// <reference path="Line.ts" />


class Obstacle {

    point_:Vector2;
    unitDir_:Vector2;
    isConvex_:boolean;
    id_:number;
    prevObstacle_ : Obstacle;
    nextObstacle_ : Obstacle;

}
