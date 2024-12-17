import type { Point } from "./game.js";
import { keyPositions } from "./keyPositions.js";

export class KeyboardEffect {
  private ctx: CanvasRenderingContext2D;
  private letters: Array<{ char: string; position: Point; opacity: number }> =
    [];
  private readonly fadeSpeed = 0.01;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public handleKeyPress(e: KeyboardEvent): void {
    const key = e.key.toLowerCase();
    console.log(key);
    const xPosition = keyPositions[key as keyof typeof keyPositions] ?? 0.5;
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

  public loop(): void {
    // Fade out letters
    this.letters = this.letters.filter((letter) => {
      letter.opacity -= this.fadeSpeed;
      return letter.opacity > 0;
    });
  }

  public draw(): void {
    this.letters.forEach((letter) => {
      this.ctx.fillStyle = `rgba(255, 255, 255, ${letter.opacity})`;
      this.ctx.font = "24px sans-serif";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText(letter.char, letter.position.x, letter.position.y);
    });
  }
}
