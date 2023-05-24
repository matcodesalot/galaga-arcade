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

//Raindrop class
class Raindrop {
    constructor() {
        this.x = getRandomFloat(0, SCREEN_WIDTH);
        this.y = getRandomFloat(-SCREEN_HEIGHT, 0);
        this.length = getRandomFloat(10, 20);
        this.width = getRandomFloat(1, 4);
        this.speed = getRandomFloat(2, 4);
        this.color = `rgb(${getRandomInt(0, 255)}, ${getRandomInt(0, 255)}, ${getRandomInt(0, 255)})`;
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
        this.y += this.speed;
        if (this.y > SCREEN_HEIGHT * 2) {
            this.y = 0;
        }
        this.draw();
    }
}

class Player {
    constructor() {
        this.position = {
            x: SCREEN_WIDTH / 2,
            y: SCREEN_HEIGHT / 1.25
        };

        this.velocity = {
            x: 0,
            y: 0
        };

        const sprite = new Image();
        sprite.src = `assets/bb1.png`;

        sprite.onload = () => {
            this.sprite = sprite;
            this.width = 48;
            this.height = 48;
        }
    }

    draw() {
        // ctx.fillStyle = `red`;
        // ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

        if(this.sprite) {
            ctx.drawImage(this.sprite, this.position.x, this.position.y, this.width, this.height);
        }
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
    }
}

const player = new Player();

//Initialize Raindrops
const raindrops = [];
for (let i = 0; i < 50; i++) {
    raindrops.push(new Raindrop());
}

function clearScreen() {
    ctx.fillStyle = `black`;
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
}

//Update and Render Raindrops
function gameLoop() {
    clearScreen();

    for (let raindrop of raindrops) {
        raindrop.update();
    }

    player.update();
    
    requestAnimationFrame(gameLoop);
}

gameLoop();