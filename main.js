//Define the canvas, getContext, and canvas dimensions
const canvas = document.getElementById(`canvas`);
const ctx = canvas.getContext(`2d`);

// const SCREEN_WIDTH = window.innerWidth;
// const SCREEN_HEIGHT = window.innerHeight;

const SCREEN_WIDTH = 960;
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

    collidesWith(projectile) {
        // Calculate the bounds of the enemy
        if(this.sprite) {
            const enemyLeft = {...this.position}.x;
            const enemyRight = {...this.position}.x + this.width;
            const enemyTop = {...this.position}.y;
            const enemyBottom = {...this.position}.y + this.height;

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

        this.projectilesManager = new ProjectilesManager();
    }
  
    update() {
        this.drawWaveCounter();
        
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
                    break; // Break the loop as the enemy is removed
                }

                //Check if projectile went off screen
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
        // Create a new enemy and add it to the enemies array
        const enemy = new Enemy();
        enemy.velocity.y = this.enemySpeed;
        this.enemies.push(enemy);
    }

    shootProjectile(projectile) {
        this.projectilesManager.addProjectile(projectile);
    }

    drawWaveCounter() {
        ctx.font = '24px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText(`Wave: ${this.currentWave}`, 10, 30);
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
    ctx.fillStyle = `black`;
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
}


//Update and render game
function gameLoop() {
    clearScreen();

    for (let raindrop of raindrops) {
        raindrop.update();
    }

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
            const projectile = new Projectile({
                position: {
                    x: player.position.x + player.width / 2,
                    y: player.position.y
                },
                velocity: {
                    x: 0,
                    y: -5
                }
            });
            waveManager.shootProjectile(projectile);
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