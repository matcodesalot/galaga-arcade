//Mathew Johns Portfolio

const SCREEN_WIDTH = window.innerWidth;
const SCREEN_HEIGHT = window.innerHeight;

const canvas = document.getElementById(`canvas`);
const ctx = canvas.getContext(`2d`);

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

//Initialize Raindrops
const raindrops = [];
for (let i = 0; i < 50; i++) {
    raindrops.push(new Raindrop());
}

function clearScreen() {
    ctx.fillStyle = `black`;
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
}

//FPS Counter
let startTime = Date.now();
let frameCount = 0;
let showFPS = false;

const fpsElement = document.getElementById(`fps`);

function countFPS() {
    frameCount++;
    let currentTime = Date.now();
    let elapsedTime = currentTime - startTime;

    if(elapsedTime >= 1000) {
        let fps = frameCount / (elapsedTime / 1000);

        if(showFPS === false) {
            //start off the fps counter not showing
            fpsElement.style.display = "none";
        }
        else {
            //if showFPS is true (f is pressed), show it.
            fpsElement.style.display = "block";
            fpsElement.textContent = `FPS: ${fps.toFixed(2)}`;
        }
        
        startTime = currentTime;
        frameCount = 0;
    }
}

//Update and Render Raindrops
function render() {
    clearScreen();
    countFPS();

    for (let raindrop of raindrops) {
        raindrop.update();
    }
    
    requestAnimationFrame(render);
}

render();

window.addEventListener(`keydown`, (e) => {
    switch(e.key) {
        case `f`:
            if(fpsElement.style.display === "none") {
                showFPS = true;
            }
            else {
                showFPS = false;
            }
            break;
    }
});