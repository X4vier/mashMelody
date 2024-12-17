import { keyPositions } from "./keyPositions.js";
export class KeyboardEffect {
    constructor(ctx) {
        this.letters = [];
        this.fadeSpeed = 0.01;
        this.ctx = ctx;
    }
    handleKeyPress(e) {
        const key = e.key.toLowerCase();
        console.log(key);
        const xPosition = keyPositions[key] ?? 0.5;
        // Draw a vertical line at the key position
        this.ctx.beginPath();
        this.ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        this.ctx.lineWidth = 2;
        this.ctx.moveTo(xPosition * this.ctx.canvas.width, 0);
        this.ctx.lineTo(xPosition * this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.stroke();
        const position = {
            x: xPosition * this.ctx.canvas.width,
            y: Math.random() * this.ctx.canvas.height,
        };
        this.letters.push({
            char: e.key,
            position,
            opacity: 1.0,
        });
    }
    loop() {
        // Fade out letters
        this.letters = this.letters.filter((letter) => {
            letter.opacity -= this.fadeSpeed;
            return letter.opacity > 0;
        });
    }
    draw() {
        this.letters.forEach((letter) => {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${letter.opacity})`;
            this.ctx.font = "24px sans-serif";
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            this.ctx.fillText(letter.char, letter.position.x, letter.position.y);
        });
    }
}
