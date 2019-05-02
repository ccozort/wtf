//######### setup the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 512;
canvas.height = 480;
document.body.appendChild(canvas);

//######### global variables
const gravity = 9.8;
var allSprites = [];
var allCups = [];

//######### game objects

// Background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
	bgReady = true;
	console.log("background loaded successfully");
};
bgImage.src = "_images/rb_bg.png";

// ball image
var ballReady = false;
var ballImage = new Image();
ballImage.onload = function () {
	ballReady = true;
};
ballImage.src = "_images/pingpong_small.png";

// Monster image
var cupReady = false;
var cupImage = new Image();
cupImage.onload = function () {
	cupReady = true;
};
cupImage.src = "_images/cup_small.png";

function entity(img, w, h, x, y, speed) {
	this.img = img;
	this.w = w;
	this.h = h;
	this.x = x;
	this.y = y;
	this.velX = 0;
	this.velY = 0;
	this.coFriction = 0.8;
	this.friction = function () {
		if (this.velX, this.velX > 0.5) {
			this.velX -= this.coFriction;
		}
		else if (this.velX < -0.5) {
			this.velX += this.coFriction;
		}
		else {
			this.velX = 0;
		}
	};
    this.speed = speed;
	this.reset = function () {
		this.x = canvas.width/2;
	    this.y = canvas.height/2;
	};
	allSprites.push(this);
}	
  
  var Cup = function(img, w, h, x, y, speed,type) {
	entity.call(this, img, w, h, x, y, speed);
	this.type = type;
	allCups.push(this);
  };
  var Ball = function(img, w, h, x, y, speed,type) {
	entity.call(this, img, w, h, x, y, speed);
	this.type = type;
	this.coFriction = 3;
	allCups.push(this);
  };

// Monster.prototype = Object.create(entity.prototype);

var ball = new Ball(ballImage,32,32,canvas.width/2,canvas.height-32, 4);
var cup = new Cup(cupImage,32,32,100,100,0,"boss");
var cup2 = new Cup(cupImage,32,32,150,100,0,"boss");
var cup3 = new Cup(cupImage,32,32,200,100,0,"boss");
var cup5 = new Cup(cupImage,32,32,250,100,0,"boss");
var cup6 = new Cup(cupImage,32,32,300,100,0,"boss");



// var pillar = new entity()

//######### functions
 //// we don't have any yet
//######### input ***

//adding event listeners

var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.key] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.key];
}, false);

//get key input

var input = function (modifier) {
	// checks for user input
	if ("w" in keysDown) { // Player holding up
        ball.velY -= ball.speed;
    }
    if ("a" in keysDown) { // Player holding left
		ball.velX -= ball.speed;
	}
	if ("s" in keysDown) { // Player holding down
		ball.velY += ball.speed;
	}
	if ("d" in keysDown) { // Player holding right
		ball.velX += ball.speed;
	}
};

//######### updates ***
function update() {
	for(var sprite in allSprites) {
		allSprites[sprite].x += allSprites[sprite].velX;
		allSprites[sprite].y += allSprites[sprite].velY;
		allSprites[sprite].friction();
	}
}

//######### render
function render() {
    //render background first
    if (bgReady) {
        ctx.drawImage(bgImage, 0, 0);
        // console.log("background drawn successfully")
    }
    // then ball on top of background
	for (var sprite in allSprites) {
		if (ballReady) {
			ctx.drawImage(allSprites[sprite].img, allSprites[sprite].x, allSprites[sprite].y);
		}
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
// ball.reset();
main();