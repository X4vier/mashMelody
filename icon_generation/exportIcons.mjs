import fs from "fs/promises";
import sharp from "sharp";
import generateKeyboardIcon from "./generateIcon.js";

console.log("Script started...");

// Convert SVG to PNG
const convertToPNG = async (svg, size) => {
  console.log(`Converting SVG to ${size}x${size} PNG...`);

  return sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();
};

// Main function to generate all required icon sizes
const generateAllIcons = async () => {
  console.log("Starting icon generation...");
  try {
    // Create icon.iconset directory
    await fs.mkdir("icon.iconset", { recursive: true });
    console.log("Created icon.iconset directory");

    // Define required sizes for macOS icons
    const sizes = [16, 32, 64, 128, 256, 512, 1024];

    console.log("Creating keyboard icon...");
    const keyboardIcon = generateKeyboardIcon();
    console.log("Generated keyboard icon");

    const svg = keyboardIcon.generateSVG();
    console.log("Generated SVG string");

    // Generate each size
    for (const size of sizes) {
      console.log(`\nProcessing ${size}x${size} icon...`);
      try {
        const pngBuffer = await convertToPNG(svg, size);
        const filename = `icon.iconset/icon_${size}x${size}.png`;
        await fs.writeFile(filename, pngBuffer);
        console.log(`Saved ${filename}`);
      } catch (error) {
        console.error(`Error processing ${size}x${size} icon:`, error);
        throw error; // Rethrow to stop processing if something goes wrong
      }
    }

    console.log("\nAll icons generated successfully!");
    console.log("Now run: iconutil -c icns icon.iconset");
  } catch (error) {
    console.error("Error generating icons:", error);
    console.error("Stack trace:", error.stack);
    process.exit(1);
  }
};

// Execute if run directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  console.log("Running generateAllIcons...");
  generateAllIcons();
}
