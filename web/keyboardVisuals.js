import { keyHorizontalPositions, keyVerticalPositions, keyEmojis, } from "./keyPositions.js";
export class KeyboardVisuals {
    constructor(ctx) {
        this.particles = [];
        this.emojis = [];
        this.particlesPerPress = 15;
        this.maxEmojiSize = 300;
        this.emojiLifetime = 1500;
        this.ctx = ctx;
        // Calculate min/max positions
        const horizontalValues = Object.values(keyHorizontalPositions);
        const verticalValues = Object.values(keyVerticalPositions);
        // Get raw min/max values
        const rawMinX = Math.min(...horizontalValues);
        const rawMaxX = Math.max(...horizontalValues);
        const rawMinY = Math.min(...verticalValues);
        const rawMaxY = Math.max(...verticalValues);
        // Add 10% padding on each side
        const horizontalPadding = (rawMaxX - rawMinX) * 0.1;
        const verticalPadding = (rawMaxY - rawMinY) * 0.1;
        // Store padded values
        this.minX = rawMinX - horizontalPadding;
        this.maxX = rawMaxX + horizontalPadding;
        this.minY = rawMinY - verticalPadding;
        this.maxY = rawMaxY + verticalPadding;
    }
    getRandomColor() {
        const hue = Math.floor(Math.random() * 360); // Random hue between 0-360
        const saturation = 70 + Math.random() * 30; // Random saturation between 70-100%
        const lightness = 50 + Math.random() * 20; // Random lightness between 50-70%
        return `hsla(${hue}, ${saturation}%, ${lightness}%, 1)`; // Added alpha=1 for full opacity
    }
    handleKeyPress(e) {
        const key = e.key.toLowerCase();
        const rawXPosition = keyHorizontalPositions[key] ?? 0.5;
        const rawYPosition = keyVerticalPositions[key] ?? 0.5;
        // Scale positions to fill screen while maintaining relative positions
        const xPosition = (rawXPosition - this.minX) / (this.maxX - this.minX);
        const yPosition = (rawYPosition - this.minY) / (this.maxY - this.minY);
        // Add random offset to the base position that applies to all particles
        const globalOffsetRange = Math.max(this.ctx.canvas.width, this.ctx.canvas.height) * 0.1; // 10% of max canvas dimension
        const globalOffsetX = (Math.random() - 0.5) * globalOffsetRange;
        const globalOffsetY = (Math.random() - 0.5) * globalOffsetRange;
        // Create particles at key position with some random spread
        for (let i = 0; i < this.particlesPerPress; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 5; // Increased base speed from 1 to 3, max from 4 to 8
            const size = 5 + Math.random() * 8; // Increased base size from 3 to 5, max from 8 to 13
            // Add random spread around the key position
            const spread = 20; // pixels
            const randomSpreadX = (Math.random() - 0.5) * spread;
            const randomSpreadY = (Math.random() - 0.5) * spread;
            const position = {
                x: xPosition * this.ctx.canvas.width + globalOffsetX + randomSpreadX,
                y: yPosition * this.ctx.canvas.height + globalOffsetY + randomSpreadY,
            };
            this.particles.push({
                position: { ...position },
                prevPosition: { ...position },
                velocity: {
                    x: Math.cos(angle) * speed,
                    y: Math.sin(angle) * speed - 2, // Bias upward
                },
                color: this.getRandomColor(),
                size,
                life: 1.0,
                maxLife: 0.5 + Math.random() * 0.5, // Random lifespan between 0.5 and 1.0 seconds
            });
        }
        // Add emoji if key has one
        const emoji = keyEmojis[key];
        if (emoji) {
            const size = 150 + Math.random() * (this.maxEmojiSize - 150); // Random size between 150-300
            const padding = this.maxEmojiSize / 2; // Padding based on max emoji size
            const position = {
                x: padding + Math.random() * (this.ctx.canvas.width - padding * 2),
                y: padding + Math.random() * (this.ctx.canvas.height - padding * 2),
            };
            this.emojis.push({
                position,
                rotation: ((Math.random() * 60 - 30) * Math.PI) / 180, // Convert to radians
                emoji,
                size,
                createdAt: Date.now(),
            });
        }
    }
    loop() {
        // Update particle positions and life
        this.particles = this.particles.filter((particle) => {
            // Store previous position
            particle.prevPosition = { ...particle.position };
            // Update position
            particle.position.x += particle.velocity.x;
            particle.position.y += particle.velocity.y;
            // Add gravity
            particle.velocity.y += 0.1;
            // Decrease life
            particle.life -= 0.016; // Assuming 60fps
            // Keep particle if still alive
            return particle.life > 0;
        });
        // Remove old emojis
        const now = Date.now();
        this.emojis = this.emojis.filter((emoji) => now - emoji.createdAt < this.emojiLifetime);
    }
    draw() {
        // Save the context state before drawing particles
        this.ctx.save();
        // Draw particles
        this.particles.forEach((particle) => {
            const opacity = particle.life / particle.maxLife;
            const velocityMagnitude = Math.sqrt(particle.velocity.x * particle.velocity.x +
                particle.velocity.y * particle.velocity.y);
            const blurSteps = Math.min(Math.ceil(velocityMagnitude / 3), 5);
            for (let i = 0; i < blurSteps; i++) {
                const t = i / blurSteps;
                const x = particle.prevPosition.x * (1 - t) + particle.position.x * t;
                const y = particle.prevPosition.y * (1 - t) + particle.position.y * t;
                const stepOpacity = opacity * (1 / blurSteps);
                this.ctx.beginPath();
                this.ctx.globalAlpha = stepOpacity;
                this.ctx.fillStyle = particle.color;
                this.ctx.arc(x, y, particle.size * opacity, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
        // Restore context to state before particle drawing
        this.ctx.restore();
        // Draw emojis
        this.emojis.forEach((emoji) => {
            this.ctx.save();
            this.ctx.translate(emoji.position.x, emoji.position.y);
            this.ctx.rotate(emoji.rotation);
            this.ctx.font = `${Math.floor(emoji.size)}px Arial`;
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            this.ctx.fillText(emoji.emoji, 0, 0);
            this.ctx.restore();
        });
    }
}
