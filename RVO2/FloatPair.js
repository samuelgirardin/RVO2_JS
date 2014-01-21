var FloatPair = (function () {
    function FloatPair(a, b) {
        this._a = a;
        this._b = b;
    }
    FloatPair.inf = function (lhs, rhs) {
        return (lhs._a < rhs._a || !(rhs._a < lhs._a) && lhs._b < rhs._b);
    };

    FloatPair.inf_equal = function (lhs, rhs) {
        return (lhs._a == rhs._a && lhs._b == rhs._b) || lhs < rhs;
    };

    FloatPair.sup = function (lhs, rhs) {
        return !FloatPair.inf_equal(lhs, rhs);
        // return !inf_equal(lhs, rhs);
    };

    FloatPair.sup_equal = function (lhs, rhs) {
        return !FloatPair.inf;
        // return !inf(lhs, rhs);
    };
    return FloatPair;
})();
//# sourceMappingURL=FloatPair.js.map
