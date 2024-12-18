import type { Point } from "./game.js";

export class MouseTrailEffect {
  private ctx: CanvasRenderingContext2D;
  private points: Point[] = [];
  private readonly minPointsPerSecond: number = 1000;
  private headHue = 0;
  private readonly hueStep = 0.1;
  private lastPointDeletionTime: number = 0;
  private lastMousePosition: Point | null = null;
  private pollInterval: number = 16; // ~60fps
  private pollTimer: number | null = null;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.lastPointDeletionTime = performance.now();
  }

  public loop(): void {
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastPointDeletionTime) / 1000;
    let pointsToRemove = Math.round(this.minPointsPerSecond * deltaTime);

    // Only calculate excess if we still have too many points after base removal
    const remainingPoints = this.points.length - pointsToRemove;
    if (remainingPoints > 300) {
      const excess = remainingPoints - 300;
      const exponentialFactor = Math.pow(1.04, excess / 50);
      pointsToRemove += Math.round(
        this.minPointsPerSecond * deltaTime * (exponentialFactor - 1)
      );
    }

    if (this.points.length > 0 && pointsToRemove > 0) {
      this.points.splice(0, Math.min(pointsToRemove, this.points.length));
      this.lastPointDeletionTime = currentTime;
    }
  }

  public addPoints(x: number, y: number): void {
    const lastPoint = this.points[this.points.length - 1];

    if (!lastPoint) {
      this.points.push({ x, y });
      return;
    }

    if (lastPoint.x !== x || lastPoint.y !== y) {
      const dx = x - lastPoint.x;
      const dy = y - lastPoint.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const steps = Math.floor(distance);
      for (let i = 1; i <= steps; i++) {
        const ratio = i / steps;
        this.points.push({
          x: lastPoint.x + dx * ratio,
          y: lastPoint.y + dy * ratio,
        });
        this.headHue = (360 + this.headHue - this.hueStep) % 360;
      }
    }
  }

  public draw(): void {
    const originalFillStyle = this.ctx.fillStyle;

    for (let i = 0; i < this.points.length; i++) {
      const point = this.points[i];

      this.ctx.beginPath();

      const hueOffset = (this.points.length - 1 - i) * this.hueStep;
      this.ctx.fillStyle = `hsl(${
        (this.headHue + hueOffset) % 360
      }, 100%, 50%)`;

      const maxRadius = 20;
      const progress = (this.points.length - 1 - i) / (this.points.length - 1);
      const radius = maxRadius * (1 - progress);

      this.ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.fillStyle = originalFillStyle;
  }
}
