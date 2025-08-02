#!/usr/bin/env node

import sharp from 'sharp';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  techstackJsonPath: path.join(__dirname, '../src/data/techstack.json'),
  assetsDir: path.join(__dirname, '../src/assets'),
  atlasOutputDir: path.join(__dirname, '../public'),
  mappingOutputDir: path.join(__dirname, '../src/data'),
  atlasFilename: 'techstack-atlas.webp',
  mappingFilename: 'techstack-atlas-mapping.json',
  cellSize: 256,
  padding: 2,
  gridSize: 10, // 10x10 grid = 100 slots
  totalSize: null, // calculated dynamically
  supportedFormats: ['.png', '.jpg', '.jpeg', '.svg', '.gif'],
  atlasFormat: 'webp',
  webpQuality: 85,
};

CONFIG.totalSize =
  CONFIG.gridSize * CONFIG.cellSize + (CONFIG.gridSize + 1) * CONFIG.padding;

async function loadTechstackData() {
  try {
    const techstackData = await fs.readJson(CONFIG.techstackJsonPath);
    return techstackData.technologies;
  } catch (error) {
    throw new Error(`Failed to load techstack.json: ${error.message}`);
  }
}

async function prepareTechnologyImages(technologies) {
  const files = [];

  for (const tech of technologies) {
    if (!tech.icon) {
      console.warn(`Warning: Technology '${tech.id}' has no icon specified`);
      continue;
    }

    // Convert icon path to absolute path in src/assets
    const iconPath = path.join(CONFIG.assetsDir, tech.icon);

    try {
      // Check if file exists
      await fs.access(iconPath);

      const ext = path.extname(iconPath).toLowerCase();
      if (!CONFIG.supportedFormats.includes(ext)) {
        console.warn(`Warning: Unsupported format for ${tech.id}: ${ext}`);
        continue;
      }

      files.push({
        id: tech.id, // Use technology ID as key
        name: tech.name,
        path: iconPath,
        originalIcon: tech.icon,
        ext,
      });
    } catch (error) {
      console.warn(`Warning: Icon not found for ${tech.id}: ${iconPath}`);
    }
  }

  return files;
}

async function processImage(
  imagePath,
  targetSize,
  backgroundColor = 'transparent'
) {
  const ext = path.extname(imagePath).toLowerCase();

  let image;

  if (ext === '.svg') {
    // Handle SVG files - resize and center in target size
    image = sharp(imagePath)
      .resize(targetSize, targetSize, {
        fit: 'contain',
        background: backgroundColor,
        position: 'center'
      })
      .png();
  } else {
    // Handle raster images - resize and center in target size
    image = sharp(imagePath)
      .resize(targetSize, targetSize, {
        fit: 'contain',
        background: backgroundColor,
        position: 'center'
      })
      .png();
  }

  return await image.toBuffer();
}

async function generateAtlas(imageFiles) {
  console.log(
    `Generating texture atlas for ${imageFiles.length} technologies...`
  );

  // Create base atlas image
  const atlas = sharp({
    create: {
      width: CONFIG.totalSize,
      height: CONFIG.totalSize,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  });

  const compositeImages = [];
  const mapping = {
    textureSize: [CONFIG.totalSize, CONFIG.totalSize],
    cellSize: CONFIG.cellSize,
    gridSize: CONFIG.gridSize,
    padding: CONFIG.padding,
    textures: {},
  };

  // Process each image and add to atlas
  for (
    let i = 0;
    i < imageFiles.length && i < CONFIG.gridSize * CONFIG.gridSize;
    i++
  ) {
    const file = imageFiles[i];
    const row = Math.floor(i / CONFIG.gridSize);
    const col = i % CONFIG.gridSize;

    // Calculate position with padding
    const x = CONFIG.padding + col * (CONFIG.cellSize + CONFIG.padding);
    const y = CONFIG.padding + row * (CONFIG.cellSize + CONFIG.padding);

    try {
      console.log(`Processing ${file.id} (${file.name})...`);

      // Process the image
      const imageBuffer = await processImage(file.path, CONFIG.cellSize);

      // Add to composite
      compositeImages.push({
        input: imageBuffer,
        top: y,
        left: x,
      });

      // Calculate UV coordinates (0-1 range)
      const uvMinX = x / CONFIG.totalSize;
      const uvMinY = 1 - (y + CONFIG.cellSize) / CONFIG.totalSize; // Flip Y axis
      const uvMaxX = (x + CONFIG.cellSize) / CONFIG.totalSize;
      const uvMaxY = 1 - y / CONFIG.totalSize; // Flip Y axis

      // Use technology ID as the key
      const technologyId = file.id;

      // Store mapping data
      mapping.textures[technologyId] = {
        uvOffset: [uvMinX, uvMinY],
        uvRepeat: [uvMaxX - uvMinX, uvMaxY - uvMinY],
      };
    } catch (error) {
      console.warn(`Warning: Could not process ${file.path}:`, error.message);
    }
  }

  // Create the final atlas with appropriate format
  let atlasBuffer;
  if (CONFIG.atlasFormat === 'webp') {
    atlasBuffer = await atlas
      .composite(compositeImages)
      .webp({ quality: CONFIG.webpQuality })
      .toBuffer();
  } else {
    atlasBuffer = await atlas
      .composite(compositeImages)
      .png()
      .toBuffer();
  }

  return { atlasBuffer, mapping };
}

async function main() {
  try {
    console.log('Starting texture atlas generation...');

    // Ensure output directories exist
    await fs.ensureDir(CONFIG.atlasOutputDir);
    await fs.ensureDir(CONFIG.mappingOutputDir);

    // Load technology data from techstack.json
    console.log(`Loading technology data from ${CONFIG.techstackJsonPath}...`);
    const technologies = await loadTechstackData();
    console.log(`Found ${technologies.length} technologies in techstack.json`);

    // Prepare technology images based on techstack.json
    const imageFiles = await prepareTechnologyImages(technologies);

    if (imageFiles.length === 0) {
      console.warn('No valid technology icons found!');
      return;
    }

    console.log(`Successfully prepared ${imageFiles.length} technology icons`);

    if (imageFiles.length > CONFIG.gridSize * CONFIG.gridSize) {
      console.warn(
        `Warning: Found ${imageFiles.length} technologies, but atlas can only hold ${CONFIG.gridSize * CONFIG.gridSize}. Some technologies will be skipped.`
      );
    }

    // Generate atlas
    const { atlasBuffer, mapping } = await generateAtlas(imageFiles);

    // Write atlas image
    const atlasPath = path.join(CONFIG.atlasOutputDir, CONFIG.atlasFilename);
    await fs.writeFile(atlasPath, atlasBuffer);
    console.log(`✅ Atlas saved to: ${atlasPath}`);

    // Write mapping JSON
    const mappingPath = path.join(
      CONFIG.mappingOutputDir,
      CONFIG.mappingFilename
    );
    await fs.writeJson(mappingPath, mapping, { spaces: 2 });
    console.log(`✅ Mapping saved to: ${mappingPath}`);

    console.log(`\n📊 Atlas Statistics:`);
    console.log(`   Size: ${CONFIG.totalSize}x${CONFIG.totalSize}px`);
    console.log(`   Technologies: ${Object.keys(mapping.textures).length}`);
    console.log(`   Cell size: ${CONFIG.cellSize}x${CONFIG.cellSize}px`);
    console.log(`   Grid: ${CONFIG.gridSize}x${CONFIG.gridSize}`);

    console.log('\n🎉 Texture atlas generation complete!');
  } catch (error) {
    console.error('❌ Error generating texture atlas:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateAtlas, CONFIG };
