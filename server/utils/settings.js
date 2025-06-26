import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define settings file path
const settingsFile = path.join(__dirname, '../../settings.json');

// Make sure directory exists
const settingsDir = path.dirname(settingsFile);
if (!fs.existsSync(settingsDir)) {
  fs.mkdirSync(settingsDir, { recursive: true });
}

// Default settings
const defaultSettings = {
  demoMode: true,
  debugMode: false
};

// Create settings file if it doesn't exist
if (!fs.existsSync(settingsFile)) {
  try {
    fs.writeFileSync(settingsFile, JSON.stringify(defaultSettings, null, 2));
    console.log('Created settings file with default values');
  } catch (err) {
    console.error('Failed to create settings file:', err);
    // In case the file can't be written (e.g., due to permissions)
    // we'll just use in-memory settings
  }
}

// Function to get settings
export const getSettings = () => {
  try {
    // Read settings from file
    let settings;
    
    // Check if we can read the file
    if (fs.existsSync(settingsFile)) {
      settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
    } else {
      // Use environment variables if available
      settings = {
        demoMode: process.env.VITE_DEMO_MODE === 'true' || process.env.DEMO_MODE === 'true',
        debugMode: process.env.VITE_DEBUG_MODE === 'true' || process.env.DEBUG_MODE === 'true'
      };
      console.log('Using settings from environment variables');
    }
    
    return { ...defaultSettings, ...settings };
  } catch (error) {
    console.error('Error reading settings file:', error);
    return defaultSettings;
  }
};

// Function to update settings
export const updateSettings = (newSettings) => {
  try {
    if (!fs.existsSync(settingsFile) && !fs.existsSync(path.dirname(settingsFile))) {
      fs.mkdirSync(path.dirname(settingsFile), { recursive: true });
    }
    
    // Read current settings
    const currentSettings = getSettings();
    
    // Merge with new settings
    const settings = { ...currentSettings, ...newSettings };
    
    // Try to write to file
    try {
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
    } catch (writeError) {
      console.error('Failed to write settings file:', writeError);
      // Continue without writing to file
    }
    
    return settings;
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
};