//Define the canvas, getContext, and canvas dimensions
const canvas = document.getElementById(`canvas`);
const ctx = canvas.getContext(`2d`);

const SCREEN_WIDTH = 960;
const SCREEN_HEIGHT = window.innerHeight;

canvas.width = SCREEN_WIDTH;
canvas.height = SCREEN_HEIGHT;

let mouseControls = true;
let keyboardControls = false;

const moneyEl = document.getElementById(`money`);
const waveEl = document.getElementById(`wave`);

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
  
        this.position = {
            x: SCREEN_WIDTH / 2 - this.width / 2,
            y: SCREEN_HEIGHT - this.height - 40
        };
    
        this.mousePos = {
            x: SCREEN_WIDTH / 2 - 40,
            y: SCREEN_HEIGHT / 2 + 200
        };
    
        this.spriteURLs = [
            "./assets/player_1.png",
            "./assets/player_2.png",
            "./assets/player_3.png"
        ];
    
        this.spriteImages = [];
        this.currentFrame = 0;
        this.frameCount = this.spriteURLs.length;
        this.loadImages(this.spriteURLs);
        this.intervalId = null;
        this.width = 0;
        this.height = 0;
    }
    
    loadImages(spriteURLs) {
        let loadedCount = 0;

            const loadImage = (url) => {
            const image = new Image();
            image.src = url;
            image.onload = () => {
                loadedCount++;
                if (loadedCount === this.frameCount) {
                    const scale = 1;
                    this.width = image.width * scale; // Set the width of the player sprite based on the loaded image
                    this.height = image.height * scale; // Set the height of the player sprite based on the loaded image
                    this.position.x = SCREEN_WIDTH / 2 - this.width / 2; // Calculate the initial X position of the player
                    this.position.y = SCREEN_HEIGHT - this.height - 40; // Calculate the initial Y position of the player
                    this.startAnimation();
                }
            };
            this.spriteImages.push(image);
        };
        
        spriteURLs.forEach((url) => loadImage(url));
    }
    
    updateFrame() {
        this.currentFrame = (this.currentFrame + 1) % this.frameCount;
    }
    
    draw() {
        ctx.drawImage(this.spriteImages[this.currentFrame], this.position.x, this.position.y, this.width, this.height);
    }
    
    startAnimation() {
        this.intervalId = setInterval(() => {
            this.updateFrame();
        }, 80); // Adjust the interval duration for smoother animation
    }
    
    stopAnimation() {
        clearInterval(this.intervalId);
        this.intervalId = null;
    }
    
    updateKeyboard() {
        //if (this.sprite) {
            this.draw();
            this.position.x += this.velocity.x;
            this.position.y += this.velocity.y;
        //}
    }
    
    updateMouse() {
        //if (this.sprite) {
            this.draw();
            this.position.x = this.mousePos.x;
            this.position.y = this.mousePos.y;
        //}
    }
}
  

class Projectile {
    constructor({position, velocity, spriteSrc}) {
        this.position = position;
        this.velocity = velocity;

        const sprite = new Image();
        sprite.src = spriteSrc;

        sprite.onload = () => {
            const scale = 1;
            this.sprite = sprite;
            this.width = sprite.width * scale;
            this.height = sprite.height * scale;
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

class Enemy {
    constructor() {
        this.velocity = {
            x: 0,
            y: 0
        };

        const sprite = new Image();
        sprite.src = `./assets/enemy_1_1.png`;

        sprite.onload = () => {
            const scale = 1;
            this.sprite = sprite;
            this.width = sprite.width * scale;
            this.height = sprite.height * scale;

            this.position = {
                x: Math.random() * (SCREEN_WIDTH - this.width),
                y: -40
            };
        }
    }

    collidesWith(projectile) {
        // Calculate the bounds of the enemy
        if(this.sprite) {
            const enemyLeft = this.position.x;
            const enemyRight = this.position.x + this.width;
            const enemyTop = this.position.y;
            const enemyBottom = this.position.y + this.height;

            // Calculate the bounds of the projectile
            const projectileLeft = projectile.position.x;
            const projectileRight = projectile.position.x + projectile.width;
            const projectileTop = projectile.position.y;
            const projectileBottom = projectile.position.y + projectile.height;

            // Check for collision
            if (enemyLeft < projectileRight && enemyRight > projectileLeft && enemyTop < projectileBottom && enemyBottom > projectileTop) {
                return true; // Collision detected
            }

            return false; // No collision
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

class ProjectilesManager {
    constructor() {
        this.projectiles = [];
    }
    
    addProjectile(projectile) {
        this.projectiles.push(projectile);
    }
    
    removeProjectile(projectile) {
        const index = this.projectiles.indexOf(projectile);
        if (index !== -1) {
            this.projectiles.splice(index, 1);
        }
    }
    
    update() {
        this.projectiles.forEach((projectile) => {
            projectile.update();
        });
    }
}

class WaveManager {
    constructor() {
        this.currentWave = 1;
        this.enemiesPerWave = 5;
        this.enemySpeed = 1;
        this.spawnDelay = 1000; // milliseconds
        this.lastSpawnTime = 0;
        this.enemiesSpawned = 0;
        this.enemies = [];
        this.money = 0;
        this.isShooting = false;
        this.shootTimer = null;

        this.projectilesManager = new ProjectilesManager();
    }
  
    update() {
        moneyEl.innerHTML = `$${this.money}`;
        waveEl.innerHTML = `Wave: ${this.currentWave}`;
        
        //Check if it's time to spawn a new enemy
        const currentTime = Date.now();
        if (currentTime - this.lastSpawnTime >= this.spawnDelay && this.enemiesSpawned < this.enemiesPerWave) {
            this.spawnEnemy();
            this.lastSpawnTime = currentTime;
            this.enemiesSpawned++;
        }
        
        this.projectilesManager.update();

        //Iterate over enemies to check for collision with the projectiles
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            //Update and draw enemies
            const enemy = this.enemies[i];
            enemy.update();

            //Check if enemy has moved past the bottom of the screen
            if({...enemy.position}.y > SCREEN_HEIGHT) {
                this.enemies.splice(i, 1);
            }
    
            //Iterate over active projectiles
            for (let j = this.projectilesManager.projectiles.length - 1; j >= 0; j--) {
                const projectile = this.projectilesManager.projectiles[j];
    
                //Check for collision between enemy and projectile
                if (enemy.collidesWith(projectile)) {
                    this.projectilesManager.removeProjectile(projectile); // Remove projectile
                    this.enemies.splice(i, 1); // Remove enemy from the array
                    this.money += 10;
                    break; // Break the loop as the enemy is removed
                }

                //Check if projectile went off top of screen
                if(projectile.position.y + projectile.height <= 0) {
                    this.projectilesManager.removeProjectile(projectile); // Remove projectile
                }
            }
        }

        if (this.enemies.length === 0 && this.enemiesSpawned === this.enemiesPerWave) {
            this.enemiesSpawned = 0; // Reset enemiesSpawned counter
            this.currentWave++; // Increase the wave counter
            this.enemiesPerWave += 2; // Increase the number of enemies per wave
            //this.spawnDelay -= 100; // Increase the spawn rate of enemies per wave
        }
    }
    
    spawnEnemy() {
        //Create a new enemy and add it to the enemies array
        const enemy = new Enemy();
        enemy.velocity.y = this.enemySpeed;
        this.enemies.push(enemy);
    }

    shootProjectile() {
        const projectile = new Projectile({
            position: {
                x: player.position.x + player.width / 2,
                y: player.position.y
            },
            velocity: {
                x: 0,
                y: -5
            },
            spriteSrc: `./assets/projectile_1.png`
        });

        this.projectilesManager.addProjectile(projectile);
    }

    startShooting() {
        if (!this.isShooting) {
            this.isShooting = true;
            this.shootProjectile();
            this.shootTimer = setInterval(() => {
                this.shootProjectile();
            }, 200);
        }
    }

    stopShooting() {
        if (this.isShooting) {
            this.isShooting = false;
            clearInterval(this.shootTimer);
            this.shootTimer = null;
        }
    }
}

//Initialize Player
const player = new Player();
//Initialize WaveManager
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
    ctx.fillStyle = `rgb(30, 4, 82)`;
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
}

//Update and render game
function gameLoop() {
    clearScreen();

    for (let raindrop of raindrops) {
        raindrop.update();
    }

    if(keyboardControls) {
        if(keys.left.pressed && lastKey === `left` && player.position.x >= 0) {
            player.velocity.x = -5;
        }
        else if (keys.right.pressed && lastKey === `right` && player.position.x + player.width <= SCREEN_WIDTH) {
            player.velocity.x = 5;
        }
        else {
            player.velocity.x = 0;
        }
    
        player.updateKeyboard();
    }

    if(mouseControls) {
        player.updateMouse();
    }

    waveManager.update();
    
    requestAnimationFrame(gameLoop);
}
gameLoop();

if(keyboardControls) {
//keyboard inputs
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
            waveManager.startShooting();
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
            waveManager.stopShooting();
            break;
    }
});
}



if(mouseControls) {
//mouse inputs
canvas.addEventListener(`mousemove`, (e) => {
    const rect = canvas.getBoundingClientRect();
    player.mousePos.x = e.clientX - rect.left;
    player.mousePos.y = e.clientY - rect.top;
});

canvas.addEventListener(`mousedown`, (e) => {
    e.preventDefault();
    
    switch(e.button) {
        case 0:
            keys.shoot.pressed = true;
            waveManager.startShooting();
            break;
    }
});

canvas.addEventListener(`mouseup`, (e) => {
    switch(e.button) {
        case 0:
            keys.shoot.pressed = false;
            waveManager.stopShooting();
            break;
    }
});

canvas.addEventListener(`mouseleave`, () => {
    waveManager.stopShooting();
});
}