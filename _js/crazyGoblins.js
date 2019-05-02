//lovingly stolen from http://www.lostdecadegames.com/how-to-make-a-simple-html5-canvas-game/
//...and modified heavily

// Create the canvas
// declares variable to hold the canvas object/API

/* Goals
	- Defeat waves of monsters
	- Must hit the monster, can't go off screen, cannot fly 
	- Score
	- Can move from side to side
*/

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
var playing = true;
var monstersCaught = 0;
//for timing
var now;
var delta;
var gravity = 2;
//for arrays
var allMonsters = [];
var allProjectiles = [];
var allPlatforms = [];
var wave = 10;
var explodeX;
var explodeY;
var shot = false;
// for animations
var timer;
var timerThen = Math.floor(Date.now() / 1000);
var timerNow;
var mouseCoords = [0,0];

//sprites
const scale = 2;
const width = 32;
const height = 32;


//################ Setting up images ##################
// animated sprites learned from: https://dev.to/martyhimmel/animating-sprite-sheets-with-javascript-ag3 

var imgReady = false;
var img = new Image();
img.onload = function () {
	imgReady = true;
};
img.src = "_images/PrinceAdamSprites.png";


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

// Monster image
var bossReady = false;
var bossImage = new Image();
bossImage.onload = function () {
	bossReady = true;
};
bossImage.src = "_images/boss.png";

var frozenReady = false;
var frozenImage = new Image();
frozenImage.onload = function () {
	frozenReady = true;
};
frozenImage.src = "_images/monster_frozen.png";

// projectile image
var projectileReady = false;
var projectileImage = new Image();
projectileImage.onload = function () {
	projectileReady = true;
};

projectileImage.src = "_images/fireball.png";

// explode image
var explodeReady = false;
var explodeImage = new Image();
explodeImage.onload = function () {
	explodeReady = true;
};
explodeImage.src = "_images/explode.png";

//################ Game Objects ##################
var hero = {
	name: "Zoltar",
	health: 200,
	x: 250,
	y:250,
	direction: 1,
	width: 32,
	height: 32,
	velX: 0,
	velY: 0,
	gravity: gravity,
	speed: 256, // movement in pixels per second
	messages: ["Hello there!", "Hi", "Whassup!"],
	speak: function () {
		console.log(this.messages[randNum(3)]);
	},
	coFriction: 0.1,
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
	grounded: false,
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
	this.types = ["normal", "boss"];
	this.type = this.types[range(0, 1)];
	this.gravity = 100;
	this.state = "normal";
	this.width = 32;
	this.height = 32;
	this.x = Math.random() * canvas.width;
	this.y = 0;
	this.velX = 0;
	this.velY = 1;
	this.jump = function () {
		this.y = 0;
	};
	allMonsters.push(this);
}

function Projectile() {
	this.speed = 25;
	this.width = 16;
	this.height = 32;
	this.x = hero.x;
	this.y = hero.y;
	this.fired = false;
	this.type = "fire";
	this.directionX = mouseCoords[0] - hero.x;
	this.directionY = mouseCoords[1] - hero.y;
	allProjectiles.push(this);
}
var projectile = new Projectile();

function shoot() {
	var bullet = new Projectile();
	var length = Math.sqrt(Math.pow(bullet.directionX, 2) + Math.pow(bullet.directionY, 2));
	bullet.directionX/=length;
	bullet.directionY/=length;
}

function Platform(x,y,w,h) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	allPlatforms.push(this);
}
var ground = new Platform(0,460,canvas.width, 20);
var randomPlat = new Platform(200,350,200,20);
console.log("here's the ground: " + ground.x);
console.log(allPlatforms[0]);

//################ Setup Keyboard controls ##################

var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.key] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.key];
}, false);

//################ Functions ##################
var reset = function () {
	// hero.x = canvas.width / 2;
	// hero.y = canvas.height / 2;
	hero.x = canvas.width/2;
	hero.y = canvas.height/2;
	hero.grounded = false;

	// Throw the monster somewhere on the screen randomly
	// Monster.x = 32 + (Math.random() * (canvas.width - 64));
	// Monster.y = 32 + (Math.random() * (canvas.height - 64));
	monsterWave(wave);
	projectile.x = hero.x;
	projectile.y = hero.y;
};
// generate random number
var randNum = function (x) {
	return Math.floor(Math.random() * x);
};
//speedup hero
var speedUp = function (x) {
	hero.speed += x;
};

function pickFrost() {
	projectileImage.src = "_images/frostball.png";
}


// //this function creates new monsters based on a range using the range function
// // testing this block
function monsterWave(max) {
	for (monster in range(1, max)) {
		monster = new Monster();
		monster.type = monster.types[randNum(2)];
	}
}
// function monsterWave(max) {
// 	for (monster in ["a",true,3,4]) {
// 		monster = new Monster();
// 	}
// }

// animated sprites learned from: https://dev.to/martyhimmel/animating-sprite-sheets-with-javascript-ag3 


function drawFrame(frameX, frameY, canvasX, canvasY) {
	ctx.drawImage(img, frameX * width, frameY * height, width, height, canvasX, canvasY, width, height);
}

const cycleLoop = [0, 1];
let currentLoopIndex = 0;
let frameCount = 0;

function step(delay) {
	frameCount += 1;
	drawFrame(cycleLoop[currentLoopIndex], 1, hero.x, hero.y);
	if (frameCount > delay) {
		// console.log(frameCount);
		frameCount = 0;
		drawFrame(cycleLoop[currentLoopIndex], 1, hero.x, hero.y);
		currentLoopIndex++;
		// console.log(currentLoopIndex);
		if (currentLoopIndex >= cycleLoop.length) {
			currentLoopIndex = 0;
		}
	}
}

// #################### get user input #########################

var input = function (modifier) {
	// checks for user input
	if ("w" in keysDown && hero.grounded == true) { // Player holding up
		console.log(hero.grounded);
		hero.grounded = false;
		console.log("trying to jump...")
		hero.jump();
		hero.direction = 0;
		console.log(hero.direction);
	}
	if ("s" in keysDown) { // Player holding down
		hero.y += hero.speed * modifier;
		hero.direction = 1;
	}
	if ("a" in keysDown) { // Player holding left
		hero.velX = -5;
	}
	if ("d" in keysDown) { // Player holding right
		hero.velX = 5;
	}
	if (" " in keysDown) { // Player holding right
		projectile.fired = true;
		projectile.type = "fire";
		console.log("fire!");
		projectileImage.src = "_images/fireball.png";
	}
	if ("e" in keysDown) { // Player holding right
		projectile.fired = true;
		projectile.type = "frost";
		console.log("freeze");
		// pickFrost();
		projectileImage.src = "_images/frostball.png";
	}
};

//countdown timer prints undefined at the last moment
function timer(x,y) {
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


addEventListener('mousedown', mouseClick);

function mouseClick(e) {
  console.log( `
    Screen X/Y: ${e.screenX}, ${e.screenY}
	Client X/Y: ${e.clientX}, ${e.clientY}`);
	mouseCoords=  [e.clientX, e.clientY];
	console.log(mouseCoords);
	shoot();
}

function gameOver() {
	// Score
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Game Over!", canvas.width/2, canvas.height/2);
}

// ##################### Update #####################
var update = function (modifier) {
	if (hero.y >= 50000) {

		reset();
	}
	console.log(hero.y);
	hero.y += hero.velY;
	hero.x += hero.velX;
	hero.velY += gravity;
	console.log(hero.grounded);
	// if (hero.grounded = false) {
	// 	console.log("he's in the air!...")
		
	// }
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
	if (projectile.fired == true) {
		projectile.y -= projectile.speed;
		console.log("fired!")
	}
	if (projectile.y < 0) {
		projectile.fired = false;
	}
	if (projectile.fired == false) {
		projectile.x = hero.x;
		projectile.y = hero.y;
	}

	// these are the jump conditions
	// if (hero.y > canvas.height - 32) {
	// 	// console.log("he fell of the screen...")
	// 	hero.y = 448;
	// 	hero.velY = 0;
	// 	hero.grounded = true;
	// }
	
	

	// this keeps the hero on the screen...
	// if (hero.x >= canvas.width - 32) {
	// 	hero.x = canvas.width - 32;
	// 	console.log("he's off the screen...");
	// 	console.log(hero.x);
	// }

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
		if (allMonsters[monster].y <= canvas.height && allMonsters[monster].state == "normal") {
			allMonsters[monster].y += allMonsters[monster].velY;
		}
		if (allMonsters[monster].y > canvas.height && allMonsters[monster].state == "normal") {
			allMonsters[monster].jump();
			allMonsters[monster].x = randNum(canvas.width);
		}
		// console.log(allMonsters[monster].y);
	}
	
	// ##### Collision detection ######

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
			--monstersCaught;
			hero.health -= 10;
			console.log(monster);
			allMonsters.splice(monster, 1);
			console.log(allMonsters);
		}
	}
	for (monster in allMonsters) {
		if (
			projectile.x <= (allMonsters[monster].x + 32) &&
			allMonsters[monster].x <= (projectile.x + 32) &&
			projectile.y <= (allMonsters[monster].y + 32) &&
			allMonsters[monster].y <= (projectile.y + 32)
		) {
			if (projectile.type == "fire") {
				if (allMonsters[monster].state == "normal") {
					shot = true;
					++monstersCaught;
					// gameTimer.countDown += 5;
					explodeX = allMonsters[monster].x;
					explodeY = allMonsters[monster].y;
					console.log(monster);
					console.log("shot monster");
					console.log("the monster type is " + allMonsters[monster].type);
					allMonsters.splice(monster, 1);
					console.log(allMonsters);
				}
				else if (allMonsters[monster].state == "frozen") {
					allMonsters[monster].state = "normal";
					console.log("monster state changed to normal")
				}

			}
			if (projectile.type == "frost" && allMonsters[monster].type == "normal") {
				allMonsters[monster].state = "frozen";
				var freezeTimer = timer(0,3);
				allMonsters[monster].gravity = 0;
				// monsterImage.src = "_images/monster_frozen.png";
				console.log(allMonsters[monster].type);
			}
			// while (allMonsters[monster].state == "frozen") {
			// 	console.log(allMonsters[monster] + " is frozen...")
			// }
		}
	}

};//end of update function


// ################# Render/Draw section ######################
var render = function (modifier) {
	if (bgReady) {
		ctx.drawImage(bgImage, 0, 0);
		// console.log("background drawn successfully")
	}

	// if (heroReady) {
	// 	ctx.drawImage(heroImage, hero.x, hero.y);
	// }
	if (imgReady) {
		step(10);
	}

	for (projectile in allProjectiles) {
		if (projectileReady) {
			allProjectiles[projectile].x += allProjectiles[projectile].directionX*allProjectiles[projectile].speed;
			allProjectiles[projectile].y += allProjectiles[projectile].directionY*allProjectiles[projectile].speed;
			ctx.drawImage(projectileImage, allProjectiles[projectile].x, allProjectiles[projectile].y);
			// console.log("it works");
		}
}


	if (explodeReady && shot == true) {
		// while (gameTimer(25)>0) {
		// 	ctx.drawImage(explodeImage, explodeX, explodeY);
		// }
		shot = false;
		// console.log("it works");
	}


	// if (monsterReady) {
	// 	ctx.drawImage(monsterImage, monster.x, monster.y);
	// }
	//render monsters
	if (monsterReady) {
		for (monster in allMonsters) {
			if (frozenReady && allMonsters[monster].state == "frozen") {
				ctx.drawImage(frozenImage, allMonsters[monster].x, allMonsters[monster].y);
				// console.log("frozen = true...");
			}
			else if (bossReady && allMonsters[monster].type == "boss") {
				ctx.drawImage(bossImage, allMonsters[monster].x, allMonsters[monster].y);
				// console.log("boss = true...");
			}
			else if (allMonsters[monster].type == "normal") {
				ctx.drawImage(monsterImage, allMonsters[monster].x, allMonsters[monster].y);
			}
		}
	}

	for (var plat in allPlatforms) {
		ctx.rect(allPlatforms[plat].x, allPlatforms[plat].y, allPlatforms[plat].w, allPlatforms[plat].h);
	}
	ctx.rect(ground.x, ground.y, ground.w, ground.h);
	ctx.stroke();

	// Score
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Goblins caught: " + monstersCaught, 32, 32);
	// frames
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Timer: " + timer(200,300), 256, 32);

	// Create gradient
	// Create gradient
	var grd = ctx.createLinearGradient(0, 0, 200, 0);
	grd.addColorStop(0, "red");
	grd.addColorStop(1, "white");

	// Fill with gradient
	ctx.fillStyle = grd;
	ctx.fillRect(10, 10, hero.health, 20)
};

// ### ################## Main loop function ################
var main = function () {
	if (playing == false) {
		gameOver();
	}
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
// var w = window;
// requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// Let's play this game!
var then = Date.now();
reset();
main();