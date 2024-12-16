export class MouseTrailEffect {
    constructor(canvasId) {
        this.points = [];
        this.minPointsPerSecond = 1000; // Number of points to remove per second
        this.headHue = 0;
        this.lastPointDeletionTime = 0;
        this.canvas = document.getElementById(canvasId);
        const context = this.canvas.getContext("2d");
        if (!context) {
            throw new Error("Could not get 2D context from canvas");
        }
        this.ctx = context;
        this.setupCanvas();
        this.bindEvents();
        this.lastPointDeletionTime = performance.now();
        this.loop();
    }
    loop() {
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastPointDeletionTime) / 1000; // Convert to seconds
        // Calculate base points to remove based on time
        let pointsToRemove = Math.round(this.minPointsPerSecond * deltaTime);
        // Add exponential removal when over 300 points
        if (this.points.length > 300) {
            const excess = this.points.length - 300;
            const exponentialFactor = Math.pow(1.1, excess / 50); // Gradually increase removal rate
            pointsToRemove = Math.round(pointsToRemove * exponentialFactor);
        }
        if (this.points.length > 0 && pointsToRemove > 0) {
            this.points.splice(0, Math.min(pointsToRemove, this.points.length));
            this.lastPointDeletionTime = currentTime;
        }
        this.draw();
        window.requestAnimationFrame(this.loop.bind(this));
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
        this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
    }
    handleMouseMove(e) {
        const lastPoint = this.points[this.points.length - 1];
        if (!lastPoint) {
            // First point
            this.points.push({
                x: e.clientX,
                y: e.clientY,
            });
        }
        else if (lastPoint.x !== e.clientX || lastPoint.y !== e.clientY) {
            // Calculate distance between last point and current position
            const dx = e.clientX - lastPoint.x;
            const dy = e.clientY - lastPoint.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            // If distance is large, interpolate points
            const steps = Math.floor(distance / 2); // Add a point every 2 pixels
            for (let i = 1; i <= steps; i++) {
                const ratio = i / steps;
                this.points.push({
                    x: lastPoint.x + dx * ratio,
                    y: lastPoint.y + dy * ratio,
                });
                this.headHue = (360 + this.headHue - 1) % 360;
            }
        }
        this.draw();
    }
    draw() {
        // Clear canvas with fade effect
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // Draw trail
        for (let i = 0; i < this.points.length; i++) {
            const point = this.points[i];
            this.ctx.beginPath();
            // Create rainbow effect starting from back of list
            const hueOffset = this.points.length - 1 - i; // 0 for oldest point
            this.ctx.fillStyle = `hsl(${(this.headHue + hueOffset) % 360}, 100%, 50%)`;
            // Largest circle at front of array (newest point)
            const maxRadius = 20;
            const progress = (this.points.length - 1 - i) / (this.points.length - 1); // 1 for oldest, 0 for newest
            const radius = maxRadius * (1 - progress);
            this.ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
}
