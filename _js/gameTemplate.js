//lovingly stolen from http://www.lostdecadegames.com/how-to-make-a-simple-html5-canvas-game/
//...and modified heavily

//################ SETUP CANVAS ##################
//create the canvas element
var canvas = document.createElement("canvas");
//takes canvas gets its context and puts that value in the ctx variable
var ctx = canvas.getContext("2d");
// set canvas width height
canvas.width = 512;
canvas.height = 480;
//appends the canvas to the document object
document.body.appendChild(canvas);

//################ Global variables ##################
var monstersCaught = 0;
var allMonsters = [];
var allPlatforms = [];
var gravity = 2;
var wave = 10;
var timerThen = Math.floor(Date.now() / 1000);

//################ Setting up images ##################

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

// Monster image
var monsterReady = false;
var monsterImage = new Image();
monsterImage.onload = function () {
	monsterReady = true;
};
monsterImage.src = "_images/monster.png";

//################ Game Objects ##################
var hero = {
	health: 200,
	width: 32,
	height: 32,
	velX: 0,
	velY: 0,
	gravity: gravity,
	speed: 256, // movement in pixels per second
	coFriction: 0.2,
	friction: function () {
		if (this.velX > 0.1) {
			this.velX -= this.coFriction;
		}
		else if (this.velX < -0.1) {
			this.velX += this.coFriction;
		}
		else {
			this.velX = 0;
		}
	},
	grounded: true,
	jump: function () {
		this.velY -= 25;
	}
};

//this function populates an array using a range of values
function range(start, end) {
	var arr = [];
	for (let i = start; i <= end; i++) {
		arr.push(i);
	}
	return arr;
}

function Monster() {
	this.width = 32;
	this.height = 32;
	this.x = Math.random() * canvas.width;
	this.y = 0;
	this.velX = 0;
	this.velY = 3;
	this.reset = function () {
		this.y = 0;
	};
	allMonsters.push(this);
}

function Platform(x,y,w,h,type) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.velX = 1;
	this.direction = 1;
	this.type = type;
	allPlatforms.push(this);
}
var ground = new Platform(0,460,canvas.width, 20,"normal");
var randomPlat = new Platform(200,350,200,20,"normal");
var randomPlat2 = new Platform(100,200,200,20,"normal");
var randomPlat3 = new Platform(100,250,200,20,"moving");

console.log("look at all these platforms!! " + allPlatforms);


//################ Functions ##################
var reset = function () {
	hero.x = canvas.width/2;
	hero.y = canvas.height/2;
	monsterWave(wave);
};

// generate random number
var randNum = function (x) {
	return Math.floor(Math.random() * x);
};

//this function creates new monsters based on a range using the range function
function monsterWave(max) {
	for (monster in range(1, max)) {
		monster = new Monster();
	}
}

//countdown timer counts down from x to y
function counter() {
	timerNow = Math.floor(Date.now() / 1000);
	currentTimer = timerNow - timerThen;
	return currentTimer;
}
function timerUp(x,y) {
	timerNow = Math.floor(Date.now() / 1000);
	currentTimer = timerNow - timerThen;
	if (currentTimer <= y && typeof (currentTimer + x) != "undefined") {
		return currentTimer;
	}
	else {
		timerThen = timerNow;
		return x;
	}
}
function timerDown(x,y) {
	timerNow = Math.floor(Date.now() / 1000);
	currentTimer =  timerNow - timerThen;
	if (currentTimer <= y && typeof (currentTimer + x) != "undefined") {
		return y-currentTimer;
	}
	else {
		timerThen = timerNow;
		return x;
	}
}

//################ Setup Keyboard controls ##################

var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.key] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.key];
}, false);

// #################### get user input #########################

var input = function (modifier) {
	// checks for user input
	if ("w" in keysDown && hero.grounded == true) { // Player holding up
		// hero.y -= hero.speed * modifier;\
		hero.jump();
		hero.grounded = false;
	}
	if ("s" in keysDown) { // Player holding down
		hero.y += hero.speed * modifier;
	}
	if ("a" in keysDown) { // Player holding left
		hero.velX = -5;
	}
	if ("d" in keysDown) { // Player holding right
		hero.velX = 5;
	}
};

// ##################### Update #####################
var update = function (modifier) {
	hero.y += hero.velY;
	hero.x += hero.velX;
	hero.friction();
	//here's all the timer stuff
	if (hero.health < 0) {
		// console.log("he's dead!!!");
		playing = false;
	}
	if (allMonsters.length == 0) {
		console.log("next wave is ready!");
		wave += 10;
		monsterWave(wave);
	}
	if (hero.y < canvas.height) {
		// console.log("he's in the air!...")
		hero.velY += hero.gravity;
	}
	// this keeps the hero on the screen...
	if (hero.x >= canvas.width - 32) {
		hero.x = canvas.width - 32;
		console.log("he's off the screen...");
		console.log(hero.x);
	}
	if (hero.x <= 0) {
		hero.x = 0;
		console.log("he's off the screen...");
		console.log(hero.x);
	}
	if (hero.y <= 0) {
		hero.y = 0;
		console.log("he's off the top of the screen...");
		console.log(hero.y);
	}
	// this is where the monsters get updated
	for (monster in allMonsters) {
		if (allMonsters[monster].y <= canvas.height) {
			allMonsters[monster].y += allMonsters[monster].velY;
		}
		if (allMonsters[monster].y > canvas.height) {
			allMonsters[monster].reset();
            allMonsters[monster].x = randNum(canvas.width);
            hero.health-=5;
		}
	}
	for (plat in allPlatforms) {
		if  (allPlatforms[plat].x > canvas.width-allPlatforms[plat].w || allPlatforms[plat].x < 0){
			allPlatforms[plat].direction = allPlatforms[plat].direction*-1;
		}
	}

	// this is where we check to see if there is collision between any monster in the array and the hero
	for (plat in allPlatforms) {
		if (
			hero.x <= (allPlatforms[plat].x + allPlatforms[plat].w) &&
			allPlatforms[plat].x <= (hero.x + hero.width) &&
			hero.y <= (allPlatforms[plat].y + allPlatforms[plat].h) &&
			allPlatforms[plat].y <= (hero.y + hero.width)
		) {
			hero.grounded = true;
			hero.velY = 0;
			hero.y = allPlatforms[plat].y - hero.height;
		}

	}
	
	for (monster in allMonsters) {
		if (
			hero.x <= (allMonsters[monster].x + allMonsters[monster].width) &&
			allMonsters[monster].x <= (hero.x + hero.width) &&
			hero.y <= (allMonsters[monster].y + allMonsters[monster].width) &&
			allMonsters[monster].y <= (hero.y + hero.width)
		) {
			++monstersCaught;
            //uncomment below if you want hero's health to go down when colliding with monster
            //hero.health -= 10;
			console.log(monster);
			allMonsters.splice(monster, 1);
			console.log(allMonsters);
		}
	}
};//end of update function

// ################# Render/Draw section ######################
var render = function (modifier) {
    //render background first
    if (bgReady) {
		ctx.drawImage(bgImage, 0, 0);
		// console.log("background drawn successfully")
	}
    // then hero on top of background
	if (heroReady) {
		ctx.drawImage(heroImage, hero.x, hero.y);
    }
    
	//then render all monsters in the allMonsters array on top of hero and background
	if (monsterReady) {
		for (monster in allMonsters) {
				ctx.drawImage(monsterImage, allMonsters[monster].x, allMonsters[monster].y);
		}
	}
	for (plat in allPlatforms) {
		ctx.fillStyle = "red";
		ctx.fillRect(allPlatforms[plat].x,allPlatforms[plat].y,allPlatforms[plat].w,allPlatforms[plat].h);
	}

	// then Score
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Goblins caught: " + monstersCaught, 32, 32);
    
    // then Timer
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
    ctx.fillText("Timer: " + timerDown(0,5), 256, 32);
    
    // then game over
    if (hero.health < 0) {
	    ctx.fillStyle = "rgb(250, 250, 250)";
	    ctx.font = "24px Helvetica";
	    ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText("Game over...", 256, 256);
    }

	// then Create gradient rectangle
	var grd = ctx.createLinearGradient(0, 0, 200, 0);
	grd.addColorStop(0, "red");
	grd.addColorStop(1, "white");

	ctx.fillStyle = "blue";
	ctx.fillRect(50,50, 100, 20);

	// then fill with gradient tied to hero health
	ctx.fillStyle = grd;
	ctx.fillRect(10, 10, hero.health, 20)
};



// ##################### Main loop function ################
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
reset();
main();