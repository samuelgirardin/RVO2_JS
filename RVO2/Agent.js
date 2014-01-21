/// <reference path="Vector2.ts" />
/// <reference path="Line.ts" />
/// <reference path="KeyValuePair.ts" />
/// <reference path="RVOMath.ts" />
/// <reference path="Simulator.ts" />
var Agent = (function () {
    // rg: number;
    function Agent() {
        // IList <KeyValuePair <float, Agent >> agentNeighbors_ = new List < KeyValuePair < float, Agent >>();
        // IList <KeyValuePair <float, Obstacle >> obstacleNeighbors_ = new List < KeyValuePair < float, Obstacle >>();
        // internal IList <Line > orcaLines_ = new List < Line > ();
        this.agentNeighbors_ = [];
        this.obstacleNeighbors_ = [];
        this.orcaLines_ = [];
        this.maxNeighbors_ = 0;
        this.maxSpeed_ = 0;
        this.neighborDist_ = 0;
        this.orientation_ = 0;
        this.positionScreen_ = new Vector2(0, 0);
        this.radius_ = 0;
        this.timeHorizon_ = 0;
        this.timeHorizonObst_ = 0;
        this.id_ = 0;
        this.test = [];
        this.c = 0;
    }
    Agent.prototype.computeNeighbors = function () {
        this.obstacleNeighbors_ = [];
        var rangeSq = RVOMath.sqr(this.timeHorizonObst_ * this.maxSpeed_ + this.radius_);
        Simulator.Instance().kdTree_.computeObstacleNeighbors(this, rangeSq);

        this.agentNeighbors_ = [];
        if (this.maxNeighbors_ > 0) {
            Agent.rangeSq = RVOMath.sqr(this.neighborDist_);
            Simulator.Instance().kdTree_.computeAgentNeighbors(this, Agent.rangeSq);
        }
    };

    Agent.prototype.computeNewVelocity = function () {
        this.orcaLines_ = [];

        var invTimeHorizonObst = 1 / this.timeHorizonObst_;

        for (var i = 0; i < this.obstacleNeighbors_.length; ++i) {
            var obstacle1 = this.obstacleNeighbors_[i].Value;
            var obstacle2 = obstacle1.nextObstacle_;

            var relativePosition1 = obstacle1.point_.moins(this.position_);
            var relativePosition2 = obstacle2.point_.moins(this.position_);

            /*
            * Check if velocity obstacle of obstacle is already taken care of by
            * previously constructed obstacle ORCA lines.
            */
            var alreadyCovered = false;

            for (var j = 0; j < this.orcaLines_.length; ++j) {
                if (Vector2.det(relativePosition1.mul_k(invTimeHorizonObst).moins(this.orcaLines_[j].point), this.orcaLines_[j].direction) - invTimeHorizonObst * this.radius_ >= -RVOMath.RVO_EPSILON && Vector2.det(relativePosition2.mul_k(invTimeHorizonObst).moins(this.orcaLines_[j].point), this.orcaLines_[j].direction) - invTimeHorizonObst * this.radius_ >= -RVOMath.RVO_EPSILON) {
                    alreadyCovered = true;
                    break;
                }
            }

            if (alreadyCovered) {
                continue;
            }

            /* Not yet covered. Check for collisions. */
            var distSq1 = Vector2.absSq(relativePosition1);
            var distSq2 = Vector2.absSq(relativePosition2);

            var radiusSq = RVOMath.sqr(this.radius_);

            var obstacleVector = obstacle2.point_.moins(obstacle1.point_);

            // var v1: Vector2 = relativePosition1.moinsSelf();
            var s = relativePosition1.moinsSelf().mul(obstacleVector) / Vector2.absSq(obstacleVector);

            //  var v2: Vector2 = obstacleVector.mul_k(-s);
            var distSqLine = Vector2.absSq(relativePosition1.moinsSelf().plus(obstacleVector.mul_k(-s)));

            var line = new Line();

            if (s < 0 && distSq1 <= radiusSq) {
                /* Collision with left vertex. Ignore if non-convex. */
                if (obstacle1.isConvex_) {
                    line.point = new Vector2(0, 0);
                    line.direction = Vector2.normalize(new Vector2(-relativePosition1.y, relativePosition1.x));

                    this.orcaLines_.push(line);
                }
                continue;
            } else if (s > 1 && distSq2 <= radiusSq) {
                /* Collision with right vertex. Ignore if non-convex
                * or if it will be taken care of by neighoring obstace */
                if (obstacle2.isConvex_ && Vector2.det(relativePosition2, obstacle2.unitDir_) >= 0) {
                    line.point = new Vector2(0, 0);
                    line.direction = Vector2.normalize(new Vector2(-relativePosition2.y, relativePosition2.x));
                    this.orcaLines_.push(line);
                }
                continue;
            } else if (s >= 0 && s < 1 && distSqLine <= radiusSq) {
                /* Collision with obstacle segment. */
                line.point = new Vector2(0, 0);
                line.direction = obstacle1.unitDir_.moinsSelf();
                this.orcaLines_.push(line);
                continue;
            }

            /*
            * No collision.
            * Compute legs. When obliquely viewed, both legs can come from a single
            * vertex. Legs extend cut-off line when nonconvex vertex.
            */
            var leftLegDirection;
            var rightLegDirection;

            if (s < 0 && distSqLine <= radiusSq) {
                /*
                * Obstacle viewed obliquely so that left vertex
                * defines velocity obstacle.
                */
                if (!obstacle1.isConvex_) {
                    continue;
                }

                obstacle2 = obstacle1;

                var leg1 = Math.sqrt(distSq1 - radiusSq);
                leftLegDirection = new Vector2(relativePosition1.x * leg1 - relativePosition1.y * this.radius_, relativePosition1.x * this.radius_ + relativePosition1.y * leg1).div_k(distSq1);
                rightLegDirection = new Vector2(relativePosition1.x * leg1 + relativePosition1.y * this.radius_, -relativePosition1.x * this.radius_ + relativePosition1.y * leg1).div_k(distSq1);
            } else if (s > 1 && distSqLine <= radiusSq) {
                /*
                * Obstacle viewed obliquely so that
                * right vertex defines velocity obstacle.
                */
                if (!obstacle2.isConvex_) {
                    continue;
                }

                obstacle1 = obstacle2;

                var leg2 = Math.sqrt(distSq2 - radiusSq);
                leftLegDirection = new Vector2(relativePosition2.x * leg2 - relativePosition2.y * this.radius_, relativePosition2.x * this.radius_ + relativePosition2.y * leg2).div_k(distSq2);
                rightLegDirection = new Vector2(relativePosition2.x * leg2 + relativePosition2.y * this.radius_, -relativePosition2.x * this.radius_ + relativePosition2.y * leg2).div_k(distSq2);
            } else {
                /* Usual situation. */
                if (obstacle1.isConvex_) {
                    var leg1 = Math.sqrt(distSq1 - radiusSq);
                    leftLegDirection = new Vector2(relativePosition1.x * leg1 - relativePosition1.y * this.radius_, relativePosition1.x * this.radius_ + relativePosition1.y * leg1).div_k(distSq1);
                } else {
                    /* Left vertex non-convex; left leg extends cut-off line. */
                    leftLegDirection = obstacle1.unitDir_.moinsSelf();
                }

                if (obstacle2.isConvex_) {
                    var leg2 = Math.sqrt(distSq2 - radiusSq);
                    rightLegDirection = new Vector2(relativePosition2.x * leg2 + relativePosition2.y * this.radius_, -relativePosition2.x * this.radius_ + relativePosition2.y * leg2).div_k(distSq2);
                } else {
                    /* Right vertex non-convex; right leg extends cut-off line. */
                    rightLegDirection = obstacle1.unitDir_;
                }
            }

            /*
            * Legs can never point into neighboring edge when convex vertex,
            * take cutoff-line of neighboring edge instead. If velocity projected on
            * "foreign" leg, no constraint is added.
            */
            var leftNeighbor = obstacle1.prevObstacle_;

            var isLeftLegForeign = false;
            var isRightLegForeign = false;

            if (obstacle1.isConvex_ && Vector2.det(leftLegDirection, leftNeighbor.unitDir_.moinsSelf()) >= 0) {
                /* Left leg points into obstacle. */
                leftLegDirection = leftNeighbor.unitDir_.moinsSelf();
                isLeftLegForeign = true;
            }

            if (obstacle2.isConvex_ && Vector2.det(rightLegDirection, obstacle2.unitDir_) <= 0) {
                /* Right leg points into obstacle. */
                rightLegDirection = obstacle2.unitDir_;
                isRightLegForeign = true;
            }

            /* Compute cut-off centers. */
            var leftCutoff = obstacle1.point_.moins(this.position_).mul_k(invTimeHorizonObst);
            var rightCutoff = obstacle2.point_.moins(this.position_).mul_k(invTimeHorizonObst);

            var cutoffVec = rightCutoff.moins(leftCutoff);

            //var cutoffVec = new Vector2(3, 3.3);
            /* Project current velocity on velocity obstacle. */
            /* Check if current velocity is projected on cutoff circles. */
            var t = (obstacle1 == obstacle2 ? 0.5 : this.velocity_.moins(leftCutoff).mul(cutoffVec) / Vector2.absSq(cutoffVec));

            // var  tLeft : number = ((velocity_ - leftCutoff) * leftLegDirection);
            var tLeft = this.velocity_.moins(leftCutoff).mul(leftLegDirection);
            var tRight = this.velocity_.moins(rightCutoff).mul(rightLegDirection);

            if ((t < 0 && tLeft < 0) || (obstacle1 == obstacle2 && tLeft < 0 && tRight < 0)) {
                /* Project on left cut-off circle. */
                var unitW = Vector2.normalize(this.velocity_.moins(leftCutoff));

                line.direction = new Vector2(unitW.y, -unitW.x);
                line.point = leftCutoff.plus(unitW.mul_k(this.radius_ * invTimeHorizonObst));
                this.orcaLines_.push(line);
                continue;
            } else if (t > 1 && tRight < 0) {
                /* Project on right cut-off circle. */
                var unitW = Vector2.normalize(this.velocity_.moins(rightCutoff));

                line.direction = new Vector2(unitW.y, -unitW.x);
                line.point = rightCutoff.plus(unitW.mul_k(this.radius_ * invTimeHorizonObst));
                this.orcaLines_.push(line);
                continue;
            }

            /*
            * Project on left leg, right leg, or cut-off line, whichever is closest
            * to velocity.
            */
            var distSqCutoff = ((t < 0 || t > 1 || obstacle1 == obstacle2) ? Number.POSITIVE_INFINITY : Vector2.absSq(this.velocity_.moins(leftCutoff.plus(cutoffVec.mul_k(t)))));

            var distSqLeft = ((tLeft < 0) ? Number.POSITIVE_INFINITY : Vector2.absSq(this.velocity_.moins(leftCutoff.plus(leftLegDirection.mul_k(tLeft)))));

            var distSqRight = ((tRight < 0) ? Number.POSITIVE_INFINITY : Vector2.absSq(this.velocity_.moins(rightCutoff.plus(rightLegDirection.mul_k(tRight)))));

            if (distSqCutoff <= distSqLeft && distSqCutoff <= distSqRight) {
                /* Project on cut-off line. */
                line.direction = obstacle1.unitDir_.moinsSelf();
                line.point = leftCutoff.plus(new Vector2(-line.direction.y, line.direction.x).mul_k(this.radius_ + invTimeHorizonObst));
                this.orcaLines_.push(line);
                continue;
            } else if (distSqLeft <= distSqRight) {
                /* Project on left leg. */
                if (isLeftLegForeign) {
                    continue;
                }

                line.direction = leftLegDirection;
                line.point = leftCutoff.plus(new Vector2(-line.direction.y, line.direction.x).mul_k(this.radius_ + invTimeHorizonObst));

                this.orcaLines_.push(line);
                continue;
            } else {
                /* Project on right leg. */
                if (isRightLegForeign) {
                    continue;
                }

                line.direction = rightLegDirection.moinsSelf();
                line.point = rightCutoff.plus(new Vector2(-line.direction.y, line.direction.x).mul_k(this.radius_ + invTimeHorizonObst));

                this.orcaLines_.push(line);
                continue;
            }
        }

        //if (this.id_ == 0) console.log(this.orcaLines_.length);
        var numObstLines = this.orcaLines_.length;

        var invTimeHorizon = 1.0 / this.timeHorizon_;

        for (var i = 0; i < this.agentNeighbors_.length; ++i) {
            var other = this.agentNeighbors_[i].Value;

            var relativePosition = other.position_.moins(this.position_);
            var relativeVelocity = this.velocity_.moins(other.velocity_);

            var distSq = Vector2.absSq(relativePosition);
            var combinedRadius = this.radius_ + other.radius_;
            var combinedRadiusSq = RVOMath.sqr(combinedRadius);

            var line = new Line();
            var u = new Vector2(0, 0);

            if (distSq > combinedRadiusSq) {
                /* No collision. */
                var w = relativeVelocity.moins(relativePosition.mul_k(invTimeHorizon));

                /* Vector from cutoff center to relative velocity. */
                var wLengthSq = Vector2.absSq(w);

                var dotProduct1 = w.mul(relativePosition);

                if (dotProduct1 < 0 && RVOMath.sqr(dotProduct1) > combinedRadiusSq * wLengthSq) {
                    /* Project on cut-off circle. */
                    var wLength = Math.sqrt(wLengthSq);
                    var unitW = w.div_k(wLength);

                    line.direction = new Vector2(unitW.y, -unitW.x);
                    u = unitW.mul_k(combinedRadius * invTimeHorizon - wLength);
                } else {
                    /* Project on legs. */
                    var leg = Math.sqrt(distSq - combinedRadiusSq);

                    if (Vector2.det(relativePosition, w) > 0) {
                        /* Project on left leg. */
                        line.direction = new Vector2(relativePosition.x * leg - relativePosition.y * combinedRadius, relativePosition.x * combinedRadius + relativePosition.y * leg).div_k(distSq);
                    } else {
                        /* Project on right leg. */
                        line.direction = new Vector2(relativePosition.x * leg + relativePosition.y * combinedRadius, -relativePosition.x * combinedRadius + relativePosition.y * leg).div_k(distSq).moinsSelf();
                    }

                    var dotProduct2 = relativeVelocity.mul(line.direction);

                    u = line.direction.mul_k(dotProduct2).moins(relativeVelocity);
                }
            } else {
                /* Collision. Project on cut-off circle of time timeStep. */
                var invTimeStep = 1 / Simulator.Instance().timeStep_;

                /* Vector from cutoff center to relative velocity. */
                // var w: Vector2 = Vector2.v_minus(relativeVelocity, Vector2.v_mul(relativePosition, invTimeStep ));
                var w = relativeVelocity.moins(relativePosition.mul_k(invTimeStep));

                var wLength = Vector2.abs(w);
                var unitW = w.div_k(wLength);

                line.direction = new Vector2(unitW.y, -unitW.x);

                // u = Vector2.v_mul(unitW, (combinedRadius * invTimeStep - wLength));
                u = unitW.mul_k(combinedRadius * invTimeStep - wLength);
            }

            // line.point = Vector2.v_add(this.velocity_, Vector2.v_mul(u, 0.5));
            ///  line.point = this.velocity_.plus(u.mul_k(.5));
            line.point = u.mul_k(.5).plus(this.velocity_);
            this.orcaLines_.push(line);
        }

        var lineFail = this.linearProgram2(this.orcaLines_, this.maxSpeed_, this.prefVelocity_, false, this.newVelocity_);

        if (lineFail < this.orcaLines_.length) {
            this.linearProgram3(this.orcaLines_, numObstLines, lineFail, this.maxSpeed_, this.newVelocity_);
        }
    };

    Agent.prototype.insertAgentNeighbor = function (agent, rangeSq) {
        if (this != agent) {
            var distSq = Vector2.absSq(this.position_.moins(agent.position_));

            //  console.log(distSq);
            if (distSq < Agent.rangeSq) {
                if (this.agentNeighbors_.length < this.maxNeighbors_) {
                    this.agentNeighbors_.push(new KeyValuePair(distSq, agent));
                }

                var i = this.agentNeighbors_.length - 1;

                while (i != 0 && distSq < this.agentNeighbors_[i - 1].Key) {
                    this.agentNeighbors_[i] = this.agentNeighbors_[i - 1];
                    --i;
                }

                this.agentNeighbors_[i] = new KeyValuePair(distSq, agent);

                if (this.agentNeighbors_.length == this.maxNeighbors_) {
                    Agent.rangeSq = this.agentNeighbors_[this.agentNeighbors_.length - 1].Key;
                }
            }
        }
    };

    Agent.prototype.update = function () {
        this.velocity_ = this.newVelocity_;
        this.position_ = this.position_.plus(this.velocity_.mul_k(Simulator._instance.timeStep_));
        var v = 0;

        if (this.c <= 30) {
            this.orientation_ = Math.atan2(this.velocity_.y, this.velocity_.x) * 180 / 3.14 + 90;
            this.test[this.c] = this.orientation_;
            this.c++;
        } else {
            this.test.shift();
            this.test[this.c - 1] = Math.atan2(this.velocity_.y, this.velocity_.x) + Math.PI;

            for (var i = 0; i < this.test.length; ++i) {
                v += this.test[i];
            }

            v = v / this.c;
            this.orientation_ = v * 180 / 3.14 + 270;
            ;
        }
    };

    Agent.prototype.insertObstacleNeighbor = function (obstacle, rangeSq) {
        var nextObstacle_ = obstacle.nextObstacle_;

        var distSq = Vector2.distSqPointLineSegment(obstacle.point_, nextObstacle_.point_, this.position_);

        if (distSq < rangeSq) {
            this.obstacleNeighbors_.push(new KeyValuePair(distSq, obstacle));

            var i = this.obstacleNeighbors_.length - 1;
            while (i != 0 && distSq < this.obstacleNeighbors_[i - 1].Key) {
                this.obstacleNeighbors_[i] = this.obstacleNeighbors_[i - 1];
                --i;
            }
            this.obstacleNeighbors_[i] = new KeyValuePair(distSq, obstacle);
        }
    };

    Agent.prototype.linearProgram1 = function (lines, lineNo, radius, optVelocity, directionOpt, result) {
        // var dotProduct : number = Vector2.v_mul_v(lines[lineNo].point , lines[lineNo].direction);
        var dotProduct = lines[lineNo].point.mul(lines[lineNo].direction);
        var discriminant = RVOMath.sqr(dotProduct) + RVOMath.sqr(radius) - Vector2.absSq(lines[lineNo].point);

        if (discriminant < 0) {
            /* Max speed circle fully invalidates line lineNo. */
            return false;
        }

        var sqrtDiscriminant = Math.sqrt(discriminant);
        var tLeft = -dotProduct - sqrtDiscriminant;
        var tRight = -dotProduct + sqrtDiscriminant;

        for (var i = 0; i < lineNo; ++i) {
            var denominator = Vector2.det(lines[lineNo].direction, lines[i].direction);
            var numerator = Vector2.det(lines[i].direction, lines[lineNo].point.moins(lines[i].point));

            if (Math.abs(denominator) <= RVOMath.RVO_EPSILON) {
                /* Lines lineNo and i are (almost) parallel. */
                if (numerator < 0) {
                    return false;
                } else {
                    continue;
                }
            }

            var t = numerator / denominator;

            if (denominator >= 0) {
                /* Line i bounds line lineNo on the right. */
                tRight = Math.min(tRight, t);
            } else {
                /* Line i bounds line lineNo on the left. */
                tLeft = Math.max(tLeft, t);
            }

            if (tLeft > tRight) {
                return false;
            }
        }

        if (directionOpt) {
            /* Optimize direction. */
            if (optVelocity.mul(lines[lineNo].direction) > 0) {
                /* Take right extreme. */
                // result = Vector2.v_add(lines[lineNo].point, Vector2.v_mul(lines[lineNo].direction, tRight));
                this.newVelocity_ = lines[lineNo].point.plus(lines[lineNo].direction.mul_k(tRight));
            } else {
                /* Take left extreme. */ // result = Vector2.v_add(lines[lineNo].point, Vector2.v_mul(lines[lineNo].direction, tLeft));
                this.newVelocity_ = lines[lineNo].point.plus(lines[lineNo].direction.mul_k(tLeft));
            }
        } else {
            /* Optimize closest point. */
            // var t1: number = Vector2.v_mul_v(lines[lineNo].direction, Vector2.v_minus(optVelocity, lines[lineNo].point));
            var t1 = lines[lineNo].direction.mul(optVelocity.moins(lines[lineNo].point));

            if (t1 < tLeft) {
                //  result = Vector2.v_add(lines[lineNo].point, Vector2.v_mul(lines[lineNo].direction, tLeft));
                this.newVelocity_ = lines[lineNo].point.plus(lines[lineNo].direction.mul_k(tLeft));
            } else if (t1 > tRight) {
                // result = Vector2.v_add(lines[lineNo].point, Vector2.v_mul(lines[lineNo].direction, tRight));
                this.newVelocity_ = lines[lineNo].point.plus(lines[lineNo].direction.mul_k(tRight));
            } else {
                //result = Vector2.v_add(lines[lineNo].point, Vector2.v_mul(lines[lineNo].direction, t));
                this.newVelocity_ = lines[lineNo].point.plus(lines[lineNo].direction.mul_k(t1));
            }
        }

        return true;
    };

    Agent.prototype.linearProgram2 = function (lines, radius, optVelocity, directionOpt, result) {
        if (directionOpt) {
            /*
            * Optimize direction. Note that the optimization velocity is of unit
            * length in this case.
            */
            // result = optVelocity.mul_k(radius);
            this.newVelocity_ = optVelocity.mul_k(radius);
            ;
        } else if (Vector2.absSq(optVelocity) > RVOMath.sqr(radius)) {
            /* Optimize closest point and outside circle. */
            // result =
            this.newVelocity_ = Vector2.normalize(optVelocity).mul_k(radius);
        } else {
            /* Optimize closest point and inside circle. */
            // result = optVelocity;
            this.newVelocity_ = optVelocity;
        }

        for (var i = 0; i < lines.length; ++i) {
            if (Vector2.det(lines[i].direction, lines[i].point.moins(this.newVelocity_)) > 0) {
                /* Result does not satisfy constraint i. Compute new optimal result. */
                var tempResult = this.newVelocity_;
                if (!this.linearProgram1(lines, i, radius, optVelocity, directionOpt, this.newVelocity_)) {
                    // tempResult;
                    this.newVelocity_ = tempResult;
                    return i;
                }
            }
        }

        //  console.log(lines.length);
        return lines.length;
    };

    Agent.prototype.linearProgram3 = function (lines, numObstLines, beginLine, radius, result) {
        var distance = 0;

        for (var i = beginLine; i < lines.length; ++i) {
            if (Vector2.det(lines[i].direction, lines[i].point.moins(this.velocity_)) > distance) {
                /* Result does not satisfy constraint of line i. */
                //std::vector<Line> projLines(lines.begin(), lines.begin() + numObstLines);
                var projLines = [];
                for (var ii = 0; ii < numObstLines; ++ii) {
                    projLines.push(lines[ii]);
                }

                for (var j = numObstLines; j < i; ++j) {
                    var line = new Line();

                    var determinant = Vector2.det(lines[i].direction, lines[j].direction);

                    if (Math.abs(determinant) <= RVOMath.RVO_EPSILON) {
                        /* Line i and line j are parallel. */
                        if (lines[i].direction.mul(lines[j].direction) > 0) {
                            continue;
                        } else {
                            /* Line i and line j point in opposite direction. */
                            line.point = lines[i].point.plus(lines[j].point).mul_k(.5);
                        }
                    } else {
                        // line.point = Vector2.v_add(lines[i].point , Vector2.v_mul( lines[i].direction ,  (RVOMath.det(lines[j].direction, Vector2.v_minus(lines[i].point , lines[j].point)) / determinant))) ;
                        // line.point = lines[i].point + (Vector2.det(lines[j].direction, lines[i].point.moins( lines[j].point)) / determinant) * lines[i].direction;
                        var n = Vector2.det(lines[j].direction, lines[i].point.moins(lines[j].point)) / determinant;
                        var v = lines[i].direction.mul_k(n);
                        line.point = lines[i].point.plus(v);
                        // console.log("this case OO");
                    }

                    line.direction = Vector2.normalize(lines[j].direction.moins(lines[i].direction));
                    projLines.push(line);
                }

                // console.log("b", projLines.length);
                var tempResult = this.newVelocity_;
                if (this.linearProgram2(projLines, radius, new Vector2(-lines[i].direction.y, lines[i].direction.x), true, this.newVelocity_) < projLines.length) {
                    /* This should in principle not happen.  The result is by definition
                    * already in the feasible region of this linear program. If it fails,
                    * it is due to small floating point error, and the current result is
                    * kept.
                    */
                    //  result = tempResult;
                    // console.log("should not happen");
                    this.newVelocity_ = tempResult;
                }

                distance = Vector2.det(lines[i].direction, lines[i].point.moins(this.newVelocity_));
            }
        }
    };
    return Agent;
})();
//# sourceMappingURL=Agent.js.map
