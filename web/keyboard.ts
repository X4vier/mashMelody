import type { Point } from "./game.js";

export class KeyboardEffect {
  private ctx: CanvasRenderingContext2D;
  private letters: Array<{ char: string; position: Point; opacity: number }> =
    [];
  private readonly fadeSpeed = 0.01;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public handleKeyPress(e: KeyboardEvent): void {
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
