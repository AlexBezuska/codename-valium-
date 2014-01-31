var canvas = document.getElementById("game");

var manifest = {
	"images": {
		"bg": "images/bg.png",
		"wall": "images/wall.png",
		"player": "images/player.png",
		"nurse": "images/nurse.png",
		"npc": "images/npc.png"
	},
	"sounds": {
	
	},
	"fonts": [
	]
};

var valium = new Splat.Game(canvas, manifest);

var scene1;

var loading = new Splat.Scene(canvas, function(elapsedMillis) {
	if (valium.isLoaded()) {
		assetsLoaded();
		loading.stop();
		scene1.start();
	}
},
function(context) {
	var x = canvas.width / 2;
  var y = canvas.height / 2;
	context.fillStyle = "#ffffff";
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.font = "36px sans-serif";
	context.textAlign = 'center';
	context.fillText('loading...', x, y);
});

loading.start();
var wall1;

var wall1Base = new Splat.Entity(0,342,1148, 28);
var chaseSpeedX = .2;
var chaseSpeedY = .2;
var chaseDist = 300;
var player;
var nurse;
var alphaMod;



function assetsLoaded() {
	wallAnim = new Splat.makeAnimation(valium.images.get("wall"), 1, 100);
	wall1 = new Splat.AnimatedEntity(0,159,wallAnim.width, wallAnim.height, wallAnim, 0,0);


	playerRun = new Splat.makeAnimation(valium.images.get("player"), 1, 100);
	player = new Splat.AnimatedEntity(50,50,playerRun.width, 25, playerRun, 0,-playerRun.height);
	player.frictionX = .5;
	player.frictionY = .5;

	nurseRun = new Splat.makeAnimation(valium.images.get("nurse"), 1, 100);
	nurse = new Splat.AnimatedEntity(400,50,nurseRun.width, 25, nurseRun, 0,-nurseRun.height);
	//AnimatedEntity starting x, starting y, sprite width, sprite height, sprite, spriteOffsetX, spriteOffsetY
	scene1.camera = new Splat.EntityBoxCamera(player, 400, canvas.height, canvas.width/2, canvas.height/2);
	
}

function moveEntityViaKeyboard(entity) {
	if (valium.keyboard.isPressed("a") || valium.keyboard.isPressed("left")) {
		entity.vx = -0.3;
	}
	if (valium.keyboard.isPressed("d") || valium.keyboard.isPressed("right")) {
		entity.vx = 0.3;
	}
	if (valium.keyboard.isPressed("w") || valium.keyboard.isPressed("up")) {
		entity.vy = -0.3;
	}
	if (valium.keyboard.isPressed("s") || valium.keyboard.isPressed("down")) {
		entity.vy = 0.3;
	}

}



scene1 = new Splat.Scene(canvas, function(elapsedMillis) {
	//simulation function
player.move(elapsedMillis);
moveEntityViaKeyboard(player);

nurse.move(elapsedMillis);

if(nurse.collides(player)){
	nurse.resolveCollisionWith(player);
}
if(nurse.collides(wall1Base)){
	nurse.resolveCollisionWith(wall1Base);
}

if(player.collides(wall1)){
	wall1.alpha(0.4);
	//wall1.draw(context);
}
if(player.collides(wall1Base)){
	player.resolveCollisionWith(wall1Base);
}


		chase(nurse, player, chaseDist);

		
},
function(context) {
	scene1.camera.drawAbsolute(context, function() {
        context.fillStyle = "#74c5cd";
        context.fillRect(0, 0, canvas.width, canvas.height);
    });
	//drawing function
	
	context.drawImage(valium.images.get("bg"), 0, 0);
	
	player.draw(context);
	nurse.draw(context);
	wall1.draw(context);
	wall1Base.draw(context);
	
});

 
