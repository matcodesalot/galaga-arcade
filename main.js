//Define the canvas, getContext, and canvas dimensions
const canvas = document.getElementById(`canvas`);
const ctx = canvas.getContext(`2d`);

const SCREEN_WIDTH = window.innerWidth;
const SCREEN_HEIGHT = window.innerHeight;

canvas.width = SCREEN_WIDTH;
canvas.height = SCREEN_HEIGHT;

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

class Raindrop {
    constructor() {
        this.x = getRandomFloat(0, SCREEN_WIDTH);
        this.y = getRandomFloat(-SCREEN_HEIGHT, 0);
        this.length = getRandomFloat(10, 20);
        this.width = getRandomFloat(1, 4);
        this.speed = getRandomFloat(2, 4);
        this.color = `rgba(${getRandomInt(0, 255)}, ${getRandomInt(0, 255)}, ${getRandomInt(0, 255)}, 0.4)`;
    }

    draw() {
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.width, this.y + this.length / 2);
        ctx.lineTo(this.x, this.y + this.length);
        ctx.lineTo(this.x - this.width, this.y + this.length / 2);
        ctx.closePath();
        ctx.strokeStyle = this.color;
        ctx.stroke();
    }

    update() {
        this.draw();
        this.y += this.speed;
        if (this.y > SCREEN_HEIGHT * 2) {
            this.y = 0;
        }
    }
}

class Player {
    constructor() {
        this.velocity = {
            x: 0,
            y: 0
        };

        const sprite = new Image();
        sprite.src = `./assets/bb11.png`;

        sprite.onload = () => {
            const scale = 1;
            this.sprite = sprite;
            this.width = sprite.width * scale;
            this.height = sprite.height * scale;

            this.position = {
                x: SCREEN_WIDTH / 2 - this.width / 2,
                y: SCREEN_HEIGHT - this.height - 40
            };
        }
    }

    draw() {
        if(this.sprite) {
            ctx.drawImage(this.sprite, this.position.x, this.position.y, this.width, this.height);
        }
    }

    update() {
        if(this.sprite) {
            this.draw();
            this.position.x += this.velocity.x;
        }
    }
}

class Enemy {
    constructor() {
        this.velocity = {
            x: 0,
            y: 0
        };

        const sprite = new Image();
        sprite.src = `./assets/invader.png`;

        sprite.onload = () => {
            const scale = 1;
            this.sprite = sprite;
            this.width = sprite.width * scale;
            this.height = sprite.height * scale;

            this.position = {
                x: Math.random() * SCREEN_WIDTH,
                y: -40
            };
        }
    }

    draw() {
        if(this.sprite) {
            ctx.drawImage(this.sprite, this.position.x, this.position.y, this.width, this.height);
        }
    }

    update() {
        if(this.sprite) {
            this.draw();
            this.position.x += this.velocity.x;
            this.position.y += this.velocity.y;
        }
    }
}

class WaveManager {
    constructor() {
        this.currentWave = 1;
        this.enemiesPerWave = 10;
        this.enemySpeed = 1;
        this.spawnDelay = 1000; // milliseconds
        this.lastSpawnTime = 0;
        this.enemiesSpawned = 0;
        this.enemies = [];
    }
  
    update() {
        // Check if it's time to spawn a new enemy
        const currentTime = Date.now();
        if (currentTime - this.lastSpawnTime >= this.spawnDelay && this.enemiesSpawned < this.enemiesPerWave) {
            this.spawnEnemy();
            this.lastSpawnTime = currentTime;
            this.enemiesSpawned++;
        }
    
        // Update and draw all the enemies
        this.enemies.forEach((enemy) => {
            enemy.update();
        });
    }
    
    spawnEnemy() {
        // Create a new enemy and add it to the enemies array
        const enemy = new Enemy();
        enemy.velocity.y = this.enemySpeed;
        this.enemies.push(enemy);
    }
}

class Projectile {
    constructor({position, velocity}) {
        this.position = position;
        this.velocity = velocity;
        this.width = 4;
        this.height = 20;
    }

    draw() {
        ctx.fillStyle = `white`;
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

//Initialize Player
const player = new Player();

const projectiles = [];
const waveManager = new WaveManager();

//Key states
const keys = {
    left: {
        pressed: false
    },
    right: {
        pressed: false
    },
    shoot: {
        pressed: false
    }
};

//Initialize Raindrops
const raindrops = [];
for (let i = 0; i < 50; i++) {
    raindrops.push(new Raindrop());
}

function clearScreen() {
    ctx.fillStyle = `black`;
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
}


//Update and render game
function gameLoop() {
    clearScreen();

    for (let raindrop of raindrops) {
        raindrop.update();
    }

    projectiles.forEach((projectile, i) => {
        //Garbage collection
        if(projectile.position.y + projectile.height <= 0) {
            projectiles.splice(i, 1);
        }
        else {
            projectile.update();
        }
    });

    if(keys.left.pressed && lastKey === `left` && player.position.x >= 0) {
        player.velocity.x = -5;
    }
    else if (keys.right.pressed && lastKey === `right` && player.position.x + player.width <= SCREEN_WIDTH) {
        player.velocity.x = 5;
    }
    else {
        player.velocity.x = 0;
    }

    player.update();

    waveManager.update();
    
    requestAnimationFrame(gameLoop);
}
gameLoop();


//Player inputs
window.addEventListener(`keydown`, (e) => {
    e.preventDefault();
    switch(e.key) {
        case `ArrowLeft`:
            keys.left.pressed = true;
            lastKey = `left`;
            break;
        case `ArrowRight`:
            keys.right.pressed = true;
            lastKey = `right`;
            break;
        case ` `:
            keys.shoot.pressed = true;
            //lastKey = `space`;
            projectiles.push(new Projectile({
                position: {
                    x: player.position.x + player.width / 2,
                    y: player.position.y
                },
                velocity: {
                    x: 0,
                    y: -5
                }
            }));
            break;
    }
});

window.addEventListener(`keyup`, (e) => {
    switch(e.key) {
        case `ArrowLeft`:
            keys.left.pressed = false;
            break;
        case `ArrowRight`:
            keys.right.pressed = false;
            break;
        case ` `:
            keys.shoot.pressed = false;
            //lastKey = `space`;
            break;
    }
});