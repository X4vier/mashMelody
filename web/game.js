import { MouseTrailEffect } from "./mouseTrail.js";
import { SoundEffect } from "./sound.js";
import { KeyboardVisuals } from "./keyboardVisuals.js";
export class Game {
    constructor(canvasId) {
        this.pollInterval = 16; // ~60fps
        this.pollTimer = null;
        this.lastMousePosition = null;
        this.canvas = document.getElementById(canvasId);
        const context = this.canvas.getContext("2d");
        if (!context) {
            throw new Error("Could not get 2D context from canvas");
        }
        this.ctx = context;
        this.mouseTrail = new MouseTrailEffect(context);
        this.soundEffect = new SoundEffect();
        this.keyboardVisuals = new KeyboardVisuals(context);
        this.setupCanvas();
        this.bindEvents();
        this.startPolling();
        this.loop();
    }
    loop() {
        this.mouseTrail.loop();
        this.soundEffect.loop();
        this.keyboardVisuals.loop();
        this.draw();
        window.requestAnimationFrame(this.loop.bind(this));
    }
    startPolling() {
        // Clear any existing poll timer
        if (this.pollTimer !== null) {
            window.clearInterval(this.pollTimer);
        }
        // Start polling for mouse position
        this.pollTimer = window.setInterval(() => {
            if (this.lastMousePosition) {
                this.mouseTrail.addPoints(this.lastMousePosition.x, this.lastMousePosition.y);
            }
        }, this.pollInterval);
    }
    setupCanvas() {
        const resizeCanvas = () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);
    }
    bindEvents() {
        // Track mouse position even when not moving
        document.addEventListener("mousemove", (e) => {
            this.lastMousePosition = {
                x: e.clientX,
                y: e.clientY,
            };
            this.handleMouseMove(e);
        });
        // Handle when mouse leaves the window
        document.addEventListener("mouseout", (e) => {
            if (e.relatedTarget === null) {
                this.lastMousePosition = null;
            }
        });
        // Handle keyboard events
        document.addEventListener("keydown", (e) => {
            e.preventDefault();
            this.soundEffect.handleKeyPress(e);
            this.keyboardVisuals.handleKeyPress(e);
        });
        // Handle mouse clicks
        document.addEventListener("click", () => {
            this.soundEffect.handleMouseClick();
        });
    }
    handleMouseMove(e) {
        this.mouseTrail.addPoints(e.clientX, e.clientY);
    }
    draw() {
        // Clear canvas with fade effect
        const originalFillStyle = this.ctx.fillStyle;
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = originalFillStyle;
        // Draw effects
        this.soundEffect.draw();
        this.keyboardVisuals.draw();
        this.mouseTrail.draw();
    }
    // Add cleanup method
    dispose() {
        if (this.pollTimer !== null) {
            window.clearInterval(this.pollTimer);
        }
    }
}
