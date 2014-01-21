

class FloatPair {

    _a: number;
    _b: number;

    constructor(a: number, b: number) {

        this._a = a;
        this._b = b; 
    }


    static inf(lhs: FloatPair, rhs: FloatPair): boolean {

        return (lhs._a < rhs._a || !(rhs._a < lhs._a) && lhs._b < rhs._b);

    }

    static inf_equal(lhs: FloatPair, rhs: FloatPair): boolean {
        return (lhs._a == rhs._a && lhs._b == rhs._b) || lhs < rhs;
    }

    static sup(lhs: FloatPair, rhs: FloatPair): boolean {
               
        return !FloatPair.inf_equal(lhs, rhs);
       // return !inf_equal(lhs, rhs);
    }   

    static sup_equal(lhs: FloatPair, rhs: FloatPair): boolean {

        return !FloatPair.inf;       
        // return !inf(lhs, rhs); 
    }


}