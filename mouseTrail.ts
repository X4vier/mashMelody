type Point = {
  x: number;
  y: number;
};

export class MouseTrailEffect {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private points: Point[] = [];
  private readonly trailLength: number = 50;
  private hue: number = 0;

  private timeOfLastMouseMove: number = Date.now();

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    const context = this.canvas.getContext("2d");
    if (!context) {
      throw new Error("Could not get 2D context from canvas");
    }
    this.ctx = context;
    this.setupCanvas();
    this.bindEvents();
    this.loop();
  }

  private loop(): void {
    console.log("loop");
    const now = Date.now();
    const deltaTime = now - this.timeOfLastMouseMove;
    this.timeOfLastMouseMove = now;
    this.draw();
    this.points.shift();
    window.requestAnimationFrame(this.loop.bind(this));
  }

  private setupCanvas(): void {
    const resizeCanvas = () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
  }

  private bindEvents(): void {
    this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
  }

  private handleMouseMove(e: MouseEvent): void {
    this.points.push({ x: e.clientX, y: e.clientY });
    if (this.points.length > this.trailLength) {
      this.points.shift();
    }

    this.draw();
  }

  private draw(): void {
    // Clear canvas with fade effect
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw trail
    for (let i = 0; i < this.points.length - 1; i++) {
      const p1 = this.points[i];
      const p2 = this.points[i + 1];

      this.ctx.beginPath();
      this.ctx.moveTo(p1.x, p1.y);
      this.ctx.lineTo(p2.x, p2.y);

      // Create rainbow effect
      this.ctx.strokeStyle = `hsl(${this.hue + i * 2}, 100%, 50%)`;
      this.ctx.lineWidth = (i / this.points.length) * 20;
      this.ctx.stroke();
    }

    this.hue = (this.hue + 1) % 360;
  }
}
