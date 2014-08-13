"use strict";

var canvas = document.getElementById("canvas");
canvas.width = 1136;
canvas.height = 640;
if (window.ejecta) {
	console.log("Ejecta detected.");
	canvas.height = window.innerHeight * (canvas.width / window.innerWidth);
}

var canvas = document.getElementById("canvas");

var manifest = {
	"images": {
		"bg": "img/bg.png",
		"wall": "img/wall.png",
		"player": "img/player.png",
		"nurse": "img/nurse.png",
		"npc": "img/npc.png"
	},
	"sounds": {
		"stepnew1": "sound/step-new-1.mp3",
		"stepnew2": "sound/step-new-2.mp3",
		"stepnew3": "sound/step-new-3.mp3",
		"stepnew4": "sound/step-new-4.mp3",
		"stepnew5": "sound/step-new-5.mp3",
	},
	"fonts": {},
	"animations": {
		"player-male-walk-left": {
			"strip": "img/player-male-walk-left.png",
			"frames": 25,
			"msPerFrame": 100
		},
		"player-male-walk-right": {
			"strip": "img/player-male-walk-right.png",
			"frames": 25,
			"msPerFrame": 100
		},
		"player-male-walk-up": {
			"strip": "img/player-male-walk-left.png",
			"frames": 25,
			"msPerFrame": 100
		},
		"player-male-walk-down": {
			"strip": "img/player-male-walk-right.png",
			"frames": 25,
			"msPerFrame": 100
		}
	}
};


function ToggleButton(x, y, width, height, onIcon, offIcon, key, onToggle) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.onIcon = onIcon;
	this.offIcon = offIcon;
	this.key = key;
	this.toggled = true;
	this.onToggle = onToggle;
}
ToggleButton.prototype.move = function(elapsedMillis) {
	if (game.mouse.consumePressed(0, this.x, this.y, this.width, this.height)) {
		this.toggle();
	}
	if (game.keyboard.consumePressed(this.key)) {
		this.toggle();
	}
};
ToggleButton.prototype.draw = function(context) {
	var icon = this.offIcon;
	if (this.toggled) {
		icon = this.onIcon;
	}
	context.drawImage(icon, this.x, this.y);
};
ToggleButton.prototype.toggle = function() {
	if (this.onToggle(!this.toggled) !== false) {
		this.toggled = !this.toggled;
	}
};
ToggleButton.prototype.attachToRight = function(canvas, xOffset) {
	var that = this;
	var adjustX = function() {
		that.x = canvas.width - that.width - xOffset;
	};
	adjustX();
	window.addEventListener("resize", adjustX);
};

function drawEntities(context, entities) {
	entities.sort(function(a, b) {
		return b.y - a.y;
	});
	for (var i in entities) {
		entities[i].draw(context);
	}
}



var game = new Splat.Game(canvas, manifest);

function AnimationGroup() {
	this.animations = {};
}
AnimationGroup.prototype.add = function(name, animation) {
	this.animations[name] = animation;
	this.current = name;
};
AnimationGroup.prototype.each = function(callback) {
	for (var key in this.animations) {
		if (this.animations.hasOwnProperty(key)) {
			callback(this.animations[key]);
		}
	}
};
AnimationGroup.prototype.move = function(elapsedMillis) {
	this.each(function(animation) {
		animation.move(elapsedMillis);
	});
};
AnimationGroup.prototype.reset = function() {
	this.each(function(animation) {
		animation.reset();
	});
};
AnimationGroup.prototype.draw = function(context, x, y) {
	this.animations[this.current].draw(context, x, y);
};
AnimationGroup.prototype.getCurrent = function() {
	return this.animations[this.current];
};

var stepSounds = ["stepnew1", "stepnew2", "stepnew3", "stepnew4", "stepnew5"];



function generateWave(intCurrentWave) {
	if (intCurrentWave > 0) {
		switch (Math.floor(Math.random() * 3)) {
			case 0:
				return generateGenericWave(intCurrentWave);
				break;
			case 1:
				return generateSpecificWave(intCurrentWave, Math.floor(Math.random() * 3));
				break;
			case 2:
				return generateGarbageWave(intCurrentWave);
				break;
		}
	} else {
		return generateGenericWave(intCurrentWave);
	}
}



function adjustRight(x, y, width, height, obstacle) {
	x = obstacle.x + obstacle.width;
	return [x, y];
}

function adjustLeft(x, y, width, height, obstacle) {
	x = obstacle.x - width - 1;
	return [x, y];
}

function adjustUp(x, y, width, height, obstacle) {
	y = obstacle.y - height;
	return [x, y];
}

function adjustDown(x, y, width, height, obstacle) {
	y = obstacle.y + obstacle.height;
	return [x, y];
}

function adjustVertically(x, y, width, height, obstacle) {
	if (y + (height / 2) < obstacle.y + (obstacle.height / 2)) {
		return adjustUp(x, y, width, height, obstacle);
	} else {
		return adjustDown(x, y, width, height, obstacle);
	}
}

function adjustHorizontally(x, y, width, height, obstacle) {
	if (x + (width / 2) < obstacle.x + (obstacle.width / 2)) {
		return adjustLeft(x, y, width, height, obstacle);
	} else {
		return adjustRight(x, y, width, height, obstacle);
	}
}

var floorObstacles = [];

var obstacle = new Splat.Entity(0, -100, 108, canvas.height + 200); //left conveyor
obstacle.adjustClick = adjustRight;
floorObstacles.push(obstacle);

obstacle = new Splat.Entity(canvas.width - 108, -100, 108, canvas.height + 200); //right conveyor
obstacle.adjustClick = adjustLeft;
floorObstacles.push(obstacle);



obstacle = new Splat.Entity(243, 324, 639, 60); //middle machine
obstacle.adjustClick = function(x, y, width, height, obstacle) {
	var dropOffWidth = 102;
	var enclosedWidth = 276;
	var rightSide = obstacle.x + obstacle.width;
	if (x + (width / 2) > rightSide) {
		return adjustRight(x, y, width, height, obstacle);
	} else if (x + (width / 2) < obstacle.x + 380) {
		return [176, 340];
	} else {
		return adjustVertically(x, y, width, height, obstacle);
	}
};
floorObstacles.push(obstacle);



obstacle = new Splat.Entity(-100, canvas.height, (canvas.width + 200), 60); // bottom border
obstacle.adjustClick = adjustUp;
floorObstacles.push(obstacle);

obstacle = new Splat.Entity(0, 34, canvas.width, 21); // left of door
obstacle.adjustClick = adjustDown;
floorObstacles.push(obstacle);



function makeIsWalkableForObstacles(player, obstacles) {
	return function(x, y) {
		for (var i = 0; i < obstacles.length; i++) {
			var obstacle = obstacles[i];
			if (playerCollidesWithObstacle(x, y, player.width, player.height, obstacle)) {
				return false;
			}
		}
		return true;
	};
}

function playerCollidesWithObstacle(x, y, width, height, obstacle) {
	return x >= obstacle.x - width &&
		x < obstacle.x + obstacle.width &&
		y >= obstacle.y - height &&
		y < obstacle.y + obstacle.height;
}
var scriptedMoveArray = [];

function makeScriptPathTimer(player, path, targetX, targetY, playerWalk, playerCarry) {
	return new Splat.Timer(function() {
		var pathStep = (this.time * playerSpeed) | 0;
		if (pathStep >= path.length) {
			pathStep = path.length - 1;
			this.stop();
			return true;
		}
		var pos = path[pathStep];
		player.lastX = player.x;
		player.lastY = player.y;
		player.x = pos.x;
		player.y = pos.y;

		var pathVx = player.x - player.lastX;
		var pathVy = player.y - player.lastY;
		if (!this.running) {
			// align the target to the aStar grid, which is scaled
			targetX = Math.floor(targetX / 3) * 3;
			targetY = Math.floor(targetY / 3) * 3;
			// overwrite the typical direction with the un-adjusted player's click
			// this makes the player end up facing the direction the player meant him to
			pathVx = targetX - player.x;
			pathVy = targetY - player.y;
		}
		if (pathVy < 0) {
			playerWalk.current = "up";
		}
		if (pathVx < 0) {
			playerWalk.current = "left";
		}
		if (pathVx > 0) {
			playerWalk.current = "right";

		}
		if (pathVy > 0) {
			playerWalk.current = "down";
		}

	}, undefined, undefined);
}

function WaitCommand(durationMs) {
	var t = 0;
	return function(elapsedMillis) {
		t += elapsedMillis;
		return t < durationMs;
	};
}

function SoundCommand(name) {
	return function() {
		game.sounds.play(name);
		return false;
	}
}

function AnimationCommand(name, durationMs) {
	var first = true;
	return function(elapsedMillis, scene) {
		if (first) {
			scene.player.sprite = game.animations.get(name);
			scene.timers.animation = new Splat.Timer(undefined, durationMs, undefined);
			scene.timers.animation.start();
			first = false;
		}
		return scene.timers.animation.running;
	};
}

function MoveCommand(x, y) {
	var first = true;
	return function(elapsedMillis, scene) {
		if (first) {
			movePlayerToPoint(scene, scene.player, x, y);
			first = false;
		}
		return scene.timers.path && scene.timers.path.running;
	};
}


function makePathTimer(player, path, targetX, targetY, playerWalk, playerCarry, scene) {
	return new Splat.Timer(function() {
		var pathStep = (this.time * playerSpeed) | 0;
		if (pathStep >= path.length) {
			pathStep = path.length - 1;
			this.stop();
			if (scene.nextPaths && scene.nextPaths.length > 0) {
				var target = scene.nextPaths.shift();
				movePlayerToPoint(scene, player, target.targetX, target.targetY);
			}
		}
		var pos = path[pathStep];
		player.lastX = player.x;
		player.lastY = player.y;
		player.x = pos.x;
		player.y = pos.y;

		var pathVx = player.x - player.lastX;
		var pathVy = player.y - player.lastY;
		if (!this.running) {
			// align the target to the aStar grid, which is scaled
			targetX = Math.floor(targetX / 3) * 3;
			targetY = Math.floor(targetY / 3) * 3;
			// overwrite the typical direction with the un-adjusted player's click
			// this makes the player end up facing the direction the player meant him to
			pathVx = targetX - player.x;
			pathVy = targetY - player.y;
		}


	}, undefined, undefined);
}

function movePlayerToPoint(scene, player, targetX, targetY) {
	if (scene.timers.path && scene.timers.path.running) {
		if (!scene.nextPaths) {
			scene.nextPaths = [];
		}
		scene.nextPaths.push({
			targetX: targetX,
			targetY: targetY
		});
		return;
	}
	var adjusted = adjustClickCoordinate(targetX, targetY, player.width, player.height, floorObstacles);
	scene.path = scene.aStar.search(player.x, player.y, adjusted[0], adjusted[1]);
	if (scene.path.length > 0) {
		var timer = makePathTimer(player, scene.path, targetX, targetY, scene.playerWalk, scene.playerCarry, scene);
		timer.start();
		scene.timers.path = timer;
	}
}


function adjustClickCoordinate(x, y, width, height, obstacles) {
	for (var i = 0; i < obstacles.length; i++) {
		var obstacle = obstacles[i];
		if (playerCollidesWithObstacle(x, y, width, height, obstacle)) {
			if (typeof obstacle.adjustClick === 'function') {
				var adjusted = obstacle.adjustClick(x, y, width, height, obstacle);
				x = adjusted[0];
				y = adjusted[1];
			}
		}
	}
	return [x, y];
}


function resetPosition(entity) {
	entity.x = entity.lastX;
	entity.y = entity.lastY;
}

function isInside(container, item) {
	return item.x >= container.x &&
		item.x + item.width <= container.x + container.width &&
		item.y >= container.y &&
		item.y + item.height <= container.y + container.height;
}

function collidesWithAny(item, otherItems, collisionHandler) {
	var foundCollision = false;
	for (var i = 0; i < otherItems.length; i++) {
		if (item === otherItems[i]) {
			continue;
		}
		if (item.collides(otherItems[i])) {
			if (collisionHandler) {
				collisionHandler(otherItems[i]);
			}
			foundCollision = true;
		}
	}
	return foundCollision;
}



/**
 * verifies that moving along a given path does not carry a given entity into another entity
 * @param {Entity} myEnt The entity that is being moved
 * @param {number} elapsedMillis The number of milliseconds since the last frame.
 * @param {Entity} entArray The Array of potential obstructing Entities
 **/
function validateAndMove(player, elapsedMillis, obstacles) {
	player.move(elapsedMillis);

	for (var i = 0; i < obstacles.length; i++) {
		var obstacle = obstacles[i];
		if (player.collides(obstacle)) {
			player.resolveCollisionWith(obstacle);
		}
	}
}

/**
 * sorts Entities by virtual z-axis and draws them in order so that those closer to the viewer are drawn over those further away
 * @param {external:CanvasRenderingContext2D} context browser native that allows interaction with the canvas
 * @param {Entity} entities array of drawable entities
 **/
function drawEntities(context, entities) {
	entities.sort(function(a, b) {
		return (a.y + a.height) - (b.y + b.height);
	});
	for (var i in entities) {

		entities[i].draw(context);
	}
}

function drawBoxes(context, entities, color) {
	entities.sort(function(a, b) {
		return (a.y + a.height) - (b.y + b.height);
	});
	for (var i = 0; i < entities.length; i++) {
		context.fillStyle = "black";
		context.lineWidth = 3;
		context.fillRect(entities[i].x, entities[i].y, entities[i].width, entities[i].height);

	}
}

var playerSpeed = 0.4;



function randomElement(array) {
	var pos = Math.random() * array.length | 0;
	return array[pos];
}

function removeRandomElement(array) {
	var pos = Math.random() * array.length | 0;
	return array.splice(pos, 1)[0];
}

game.scenes.add("title", new Splat.Scene(canvas, function() {
	// init

}, function(elapsedMillis) {
	// simulation
	game.scenes.switchTo("main");

}, function(context) {
	// draw

}));


game.scenes.add("main", new Splat.Scene(canvas, function() {
		// init

		this.levelTime = 0;


		this.playerWalk = new AnimationGroup();

		var anim = game.animations.get("player-male-walk-up");
		anim.setWidth = 90;
		anim.setHeight = 50;
		anim.setSpriteOffsetX = 0;
		anim.setSpriteOffsetY = -251;
		this.playerWalk.add("up", anim);

		anim = game.animations.get("player-male-walk-down");
		anim.setWidth = 90;
		anim.setHeight = 50;
		anim.setSpriteOffsetX = 0;
		anim.setSpriteOffsetY = -251;
		this.playerWalk.add("down", anim);

		anim = game.animations.get("player-male-walk-left");
		anim.setWidth = 90;
		anim.setHeight = 50;
		anim.setSpriteOffsetX = 0;
		anim.setSpriteOffsetY = -251;
		this.playerWalk.add("left", anim);

		anim = game.animations.get("player-male-walk-right");
		anim.setWidth = 90;
		anim.setHeight = 50;
		anim.setSpriteOffsetX = 0;
		anim.setSpriteOffsetY = -251;
		this.playerWalk.add("right", anim);

		this.playerWalk.current = "left";

		anim.setWidth = 90;
		anim.setHeight = 50;
		anim.setSpriteOffsetX = 0;
		anim.setSpriteOffsetY = -251;
		anim.carryOffsetX = anim.width + anim.setSpriteOffsetX;
		anim.carryOffsetY = 51 + anim.setSpriteOffsetY;



		this.player = new Splat.AnimatedEntity(50, 50, 65, 20, this.playerWalk, -10, -85);
		this.player.frictionX = 0.5;
		this.player.frictionY = 0.5;
		var oldPlayerDraw = this.player.draw;

		this.player.draw = function(context) {
			oldPlayerDraw.call(this, context);

		};

		this.camera = new Splat.EntityBoxCamera(this.player, canvas.width, 100, canvas.width / 2, canvas.height - 400);
		//redefine move function so that camera can't move past bottom of the screen
		this.camera.locked = false;
		this.camera.move = function(elapsedMillis) {
			if (this.locked) {
				return;
			}
			Splat.EntityBoxCamera.prototype.move.call(this, elapsedMillis);
			if (this.y > 0) {
				this.y = 0;
			}
		}



		var state = "start";

		this.drawables = [
			this.player
		];

		var self = this;



		var scene = this;



		this.timers.playStep = new Splat.Timer(undefined, 850, function() {
			game.sounds.play(randomElement(stepSounds));
			this.reset();
			this.start();
		});


		this.aStar = new Splat.AStar(makeIsWalkableForObstacles(this.player, floorObstacles));
		this.aStar.scaleX = 3;
		this.aStar.scaleY = 3;

	},
	function(elapsedMillis) {
		// simulation

		this.levelTime += elapsedMillis;
		var animationTolerance = 0.1;
		if (this.player.vy < -animationTolerance) {
			this.playerWalk.current = "up";

		}
		if (this.player.vx < -animationTolerance) {
			this.playerWalk.current = "left";

		}
		if (this.player.vx > animationTolerance) {
			this.playerWalk.current = "right";

		}
		if (this.player.vy > animationTolerance) {
			this.playerWalk.current = "down";

		}
		var currAnim;
		if (typeof this.player.sprite.getCurrent === "function") {
			currAnim = this.player.sprite.getCurrent();
			this.player.width = currAnim.setWidth;
			this.player.height = currAnim.setHeight;
			this.player.spriteOffsetX = currAnim.setSpriteOffsetX;
			this.player.spriteOffsetY = currAnim.setSpriteOffsetY;
		} else {
			currAnim = this.player.sprite;
		}

		if (!this.player.moved()) {
			this.playerWalk.reset();
			this.timers.playStep.stop();
		} else {
			this.timers.playStep.start();
		}


		validateAndMove(this.player, elapsedMillis, floorObstacles);
		var dir = this.player.sprite.current;
		var me = this.player;


		if (game.mouse.consumePressed(0)) {
			//this.timers.path.stop();
			this.nextPaths = [];
			var targetX = game.mouse.x - (this.player.width / 2 | 0) + this.camera.x;
			var targetY = game.mouse.y - (this.player.height / 2 | 0) + this.camera.y;
			movePlayerToPoint(this, this.player, targetX, targetY);
		}

		if (game.keyboard.isPressed("r")) {
			playerSpeed = 0.25;
		} else {
			playerSpeed = 0.15;
		}
		if (game.keyboard.isPressed("left") || game.keyboard.isPressed("a")) {
			if (this.timers.path) {
				this.timers.path.stop();
			}
			this.player.vx = -playerSpeed;
		}
		if (game.keyboard.isPressed("right") || game.keyboard.isPressed("d")) {
			if (this.timers.path) {
				this.timers.path.stop();
			}
			this.player.vx = playerSpeed;
		}
		if (game.keyboard.isPressed("up") || game.keyboard.isPressed("w")) {
			if (this.timers.path) {
				this.timers.path.stop();
			}
			this.player.vy = -playerSpeed;
		}
		if (game.keyboard.isPressed("down") || game.keyboard.isPressed("s")) {
			if (this.timers.path) {
				this.timers.path.stop();
			}
			this.player.vy = playerSpeed;
		}

	},
	function(context) {
		var scene = this;
		// draw
		this.camera.drawAbsolute(context, function() {
			context.fillStyle = "#c0c0c0";
			context.fillRect(0, 0, canvas.width, canvas.height);
			context.fillStyle = "#000";

			drawBoxes(context, floorObstacles, '#000');

		});
		var drawables = this.drawables.slice(0);


		drawEntities(context, drawables);



		this.camera.drawAbsolute(context, function() {



			context.fillText(Math.floor(scene.levelTime / 1000), 400, 50);
			context.strokeStyle = "red";
			context.strokeRect(scene.player.x, scene.player.y, scene.player.width, scene.player.height);

		});

	}));



function centerText(context, text, offsetX, offsetY) {
	var w = context.measureText(text).width;
	var x = offsetX + (canvas.width / 2) - (w / 2) | 0;
	var y = offsetY | 0;
	context.fillText(text, x, y);
}

game.scenes.switchTo("loading");