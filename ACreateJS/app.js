/// <reference path="create/easeljs.d.ts" />
/// <reference path="Game.ts" />
// Author : Samuel Girardin- http://www.visualiser.fr
window.onload = function () {
    var manifest = [];
    manifest = [
        { src: "ACreateJS/assets/z1.png", id: "z1" },
        { src: "ACreateJS/assets/z2.png", id: "z2" },
        { src: "ACreateJS/assets/z3.png", id: "z3" },
        { src: "ACreateJS/assets/back.png", id: "backj" }
    ];

    var start = new Game(manifest);
};
//# sourceMappingURL=app.js.map
