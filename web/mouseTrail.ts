type Point = {
  x: number;
  y: number;
};

export class MouseTrailEffect {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private points: Point[] = [];
  private readonly minPointsPerSecond: number = 1000;
  private headHue = 0;
  private lastPointDeletionTime: number = 0;
  private lastMousePosition: Point | null = null;
  private pollInterval: number = 16; // ~60fps
  private pollTimer: number | null = null;

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    const context = this.canvas.getContext("2d");
    if (!context) {
      throw new Error("Could not get 2D context from canvas");
    }
    this.ctx = context;
    this.setupCanvas();
    this.bindEvents();
    this.lastPointDeletionTime = performance.now();
    this.startPolling();
    this.loop();
  }

  private startPolling(): void {
    // Clear any existing poll timer
    if (this.pollTimer !== null) {
      window.clearInterval(this.pollTimer);
    }

    // Start polling for mouse position
    this.pollTimer = window.setInterval(() => {
      if (this.lastMousePosition) {
        this.addPoints(this.lastMousePosition.x, this.lastMousePosition.y);
      }
    }, this.pollInterval);
  }

  private loop(): void {
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastPointDeletionTime) / 1000;
    let pointsToRemove = Math.round(this.minPointsPerSecond * deltaTime);

    // Only calculate excess if we still have too many points after base removal
    const remainingPoints = this.points.length - pointsToRemove;
    if (remainingPoints > 300) {
      const excess = remainingPoints - 300;
      const exponentialFactor = Math.pow(1.06, excess / 50);
      pointsToRemove += Math.round(
        this.minPointsPerSecond * deltaTime * (exponentialFactor - 1)
      );
    }

    if (this.points.length > 0 && pointsToRemove > 0) {
      this.points.splice(0, Math.min(pointsToRemove, this.points.length));
      this.lastPointDeletionTime = currentTime;
    }

    this.draw();
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
    // Track mouse position even when not moving
    document.addEventListener("mousemove", (e: MouseEvent) => {
      this.lastMousePosition = {
        x: e.clientX,
        y: e.clientY,
      };
      this.handleMouseMove(e);
    });

    // Handle when mouse leaves the window
    document.addEventListener("mouseout", (e: MouseEvent) => {
      if (e.relatedTarget === null) {
        this.lastMousePosition = null;
      }
    });
  }

  private addPoints(x: number, y: number): void {
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
        this.headHue = (360 + this.headHue - 1) % 360;
      }
    }
  }

  private handleMouseMove(e: MouseEvent): void {
    this.addPoints(e.clientX, e.clientY);
    this.draw();
  }

  private draw(): void {
    // Clear canvas with fade effect
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw trail
    for (let i = 0; i < this.points.length; i++) {
      const point = this.points[i];

      this.ctx.beginPath();

      const hueOffset = this.points.length - 1 - i;
      this.ctx.fillStyle = `hsl(${
        (this.headHue + hueOffset) % 360
      }, 100%, 50%)`;

      const maxRadius = 20;
      const progress = (this.points.length - 1 - i) / (this.points.length - 1);
      const radius = maxRadius * (1 - progress);

      this.ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  // Add cleanup method
  public dispose(): void {
    if (this.pollTimer !== null) {
      window.clearInterval(this.pollTimer);
    }
  }
}
