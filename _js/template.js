//######### setup the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 512;
canvas.height = 480;
document.body.appendChild(canvas);

//######### global variables
const gravity = 9.8;
var allSprites = [];
//######### game objects

// Background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
	bgReady = true;
	console.log("background loaded successfully");
};
bgImage.src = "_images/background.png";

// Hero image
var heroReady = false;
var heroImage = new Image();
heroImage.onload = function () {
	heroReady = true;
};
heroImage.src = "_images/hero.png";

function entity() {
	this.width = 32;
	this.height = 32;
	this.x = canvas.width/2;
	this.y = canvas.height/2;
	this.velX = 0;
    this.velY = 0;
    this.speed = 5;
	this.reset = function () {
		this.x = canvas.width/2;
	    this.y = canvas.height/2;
	};
	allSprites.push(this);
}

var hero = new entity();

//######### functions

//######### input

//########## adding event listener

var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.key] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.key];
}, false);

// #################### get key input #########################

var input = function (modifier) {
	// checks for user input
	if ("w" in keysDown) { // Player holding up
        hero.velY -= hero.speed;
        console.log(hero.y);
    }
    if ("a" in keysDown) { // Player holding left
		hero.velX -= hero.speed;
	}
	if ("s" in keysDown) { // Player holding down
		hero.velY += hero.speed;
	}
	if ("d" in keysDown) { // Player holding right
		hero.velX += hero.speed;
	}
};

//######### updates
function update() {
    hero.x += hero.velX;
    hero.y += hero.velY;
}

//######### render
function render() {
    //render background first
    if (bgReady) {
        ctx.drawImage(bgImage, 0, 0);
        // console.log("background drawn successfully")
    }
    // then hero on top of background
    if (heroReady) {
        ctx.drawImage(heroImage, hero.x, hero.y);
    }
}

//######### main function and run once functions
var main = function () {
	now = Date.now();
    delta = now - then;
	input(delta / 1000);
	update(delta / 1000);
	render(delta / 1000);
	then = now;
	// Request to do this again ASAP
	requestAnimationFrame(main);
};

// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// Let's play this game!
var then = Date.now();
// hero.reset();
main();