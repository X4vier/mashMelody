export class KeyboardEffect {
    constructor(ctx) {
        this.letters = [];
        this.fadeSpeed = 0.01;
        this.ctx = ctx;
    }
    handleKeyPress(e) {
        const position = {
            x: Math.random() * this.ctx.canvas.width,
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
