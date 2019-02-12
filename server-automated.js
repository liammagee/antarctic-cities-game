const fs = require("fs");
const Window = require('window'); 
window = new Window();
document = window.document;
navigator = window.navigator;

// Get content from file
var contents = fs.readFileSync("project.json");
// Define to JSON type
var config = JSON.parse(contents);

require('./frameworks/cocos2d-html5/CCBoot.js');
cc = window.cc;


// COLOR_LICORICE = new cc.Color(42, 54, 68, 255); // Dark Grey
cc._isNodeJs = true;
var canvas = document.createElement('canvas');
canvas.setAttribute("id", config["id"]);
document.body.appendChild(canvas);

cc.game.onStart = function(){
    console.log(document.body.children.length)
    console.log('started');
}
cc._load(config);
// cc.game.run(config);
// console.log(document.body.children.length)
// const dat = require('./src/dat.js');

// console.log(COLOR_LICORICE);