#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseCsv(csvContent) {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(';').map(h => h.trim());
  
  return lines.slice(1).map(line => {
    const values = line.split(';').map(v => v.trim());
    
    const row = {};
    headers.forEach((header, index) => {
      const value = values[index] || '';
      
      if (header === 'categories') {
        // Split categories by comma and trim whitespace
        row[header] = value.split(',').map(cat => cat.trim()).filter(cat => cat.length > 0);
      } else if (header === 'active') {
        // Convert to number
        row[header] = parseInt(value) || 0;
      } else {
        row[header] = value;
      }
    });
    
    return row;
  });
}

function generateTechstackJson() {
  const csvPath = path.join(__dirname, '../src/data/techstack.csv');
  const jsonPath = path.join(__dirname, '../src/data/techstack.json');
  
  try {
    console.log('📖 Reading CSV file...');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    console.log('🔄 Parsing CSV data...');
    const allTechnologies = parseCsv(csvContent);
    
    console.log('✅ Filtering active technologies...');
    // Filter only active technologies (active = 1)
    const activeTechnologies = allTechnologies.filter(tech => tech.active === 1);
    
    // Remove the 'active' field from the output
    const technologies = activeTechnologies.map(tech => {
      const { active, ...techWithoutActive } = tech;
      return techWithoutActive;
    });
    
    const jsonData = {
      technologies
    };
    
    console.log('💾 Writing JSON file...');
    fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));
    
    console.log(`🎉 Successfully generated techstack.json with ${technologies.length} active technologies!`);
    console.log(`   Total technologies in CSV: ${allTechnologies.length}`);
    console.log(`   Active technologies: ${technologies.length}`);
    console.log(`   Inactive technologies: ${allTechnologies.length - technologies.length}`);
    
  } catch (error) {
    console.error('❌ Error generating techstack.json:', error.message);
    process.exit(1);
  }
}

// Run the script
generateTechstackJson();