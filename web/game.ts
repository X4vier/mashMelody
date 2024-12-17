import { MouseTrailEffect } from "./mouseTrail.js";
import { KeyboardEffect } from "./keyboard.js";

export type Point = {
  x: number;
  y: number;
};

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private pollInterval: number = 16; // ~60fps
  private pollTimer: number | null = null;
  private lastMousePosition: Point | null = null;

  private mouseTrail: MouseTrailEffect;
  private keyboardEffect: KeyboardEffect;

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    const context = this.canvas.getContext("2d");
    if (!context) {
      throw new Error("Could not get 2D context from canvas");
    }
    this.ctx = context;
    this.mouseTrail = new MouseTrailEffect(context);
    this.keyboardEffect = new KeyboardEffect(context);
    this.setupCanvas();
    this.bindEvents();
    this.startPolling();
    this.loop();
  }

  private loop(): void {
    this.mouseTrail.loop();
    this.keyboardEffect.loop();

    this.draw();
    window.requestAnimationFrame(this.loop.bind(this));
  }

  private startPolling(): void {
    // Clear any existing poll timer
    if (this.pollTimer !== null) {
      window.clearInterval(this.pollTimer);
    }

    // Start polling for mouse position
    this.pollTimer = window.setInterval(() => {
      if (this.lastMousePosition) {
        this.mouseTrail.addPoints(
          this.lastMousePosition.x,
          this.lastMousePosition.y
        );
      }
    }, this.pollInterval);
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

    // Handle keyboard events
    document.addEventListener("keydown", (e: KeyboardEvent) => {
      e.preventDefault();
      this.keyboardEffect.handleKeyPress(e);
    });
  }

  private handleMouseMove(e: MouseEvent): void {
    this.mouseTrail.addPoints(e.clientX, e.clientY);
    this.draw();
  }

  private draw(): void {
    // Clear canvas with fade effect
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw trail
    this.mouseTrail.draw();
    this.keyboardEffect.draw();
  }

  // Add cleanup method
  public dispose(): void {
    if (this.pollTimer !== null) {
      window.clearInterval(this.pollTimer);
    }
  }
}
