import { logger } from '../utils/logger.js';
import { getSettings, updateSettings as updateSettingsFile } from '../utils/settings.js';
import { getMistralAIPrompt } from '../utils/helpers.js';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import * as XLSX from 'xlsx';

// Get __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Analyze document using OCR/AI
export const analyzeDocument = async (req, res, next) => {
  try {
    const { fileBase64, fileType } = req.body;
    const { ocrMethod } = getSettings();
    
    // Check if we have necessary data
    if (!fileBase64 || !fileType) {
      return res.status(400).json({ 
        error: true,
        message: 'Se requiere fileBase64 y fileType'
      });
    }
    
    let result;
    
    if (ocrMethod === 'mistral') {
      // Use Mistral AI for OCR
      result = await analyzeWithMistral(fileBase64, fileType);
    } else {
      // Use local OCR (simplified here)
      result = await analyzeWithLocalOCR(fileBase64, fileType);
    }
    
    res.json(result);
  } catch (error) {
    logger.error('Error analyzing document:', error);
    next(error);
  }
};

// Helper function to analyze document with Mistral AI
const analyzeWithMistral = async (fileBase64, fileType) => {
  try {
    // Skip actual API call in demo environment
    if (process.env.NODE_ENV !== 'production') {
      logger.info('Demo environment - returning mock Mistral analysis');
      
      // Return mock data
      return {
        equipments: [
          {
            name: 'Dell PowerEdge R740',
            serialNumber: 'SRV123456',
            partNumber: 'PN987654',
            type: 'Servidor',
            model: 'PowerEdge R740'
          },
          {
            name: 'Cisco Nexus 9336C',
            serialNumber: 'SW789012',
            partNumber: 'PN345678',
            type: 'Switch',
            model: 'Nexus 9336C'
          }
        ]
      };
    }
    
    // Get Mistral API Key
    const apiKey = process.env.VITE_MISTRAL_API_KEY;
    
    if (!apiKey) {
      throw new Error('Mistral API key is not configured');
    }
    
    // Get prompt
    const prompt = getMistralAIPrompt();
    
    // Determine content type
    const contentType = fileType.includes('pdf') 
      ? 'application/pdf' 
      : fileType.includes('image') 
        ? 'image/jpeg' 
        : 'application/octet-stream';
    
    // Call Mistral API
    const response = await axios.post(
      'https://api.mistral.ai/v1/chat/completions',
      {
        model: 'mistral-large-latest',
        messages: [
          { role: 'system', content: prompt },
          { 
            role: 'user', 
            content: [
              { 
                type: 'text', 
                text: 'Analiza el siguiente documento y extrae la información de los equipos' 
              },
              { 
                type: 'image', 
                image_url: {
                  url: `data:${contentType};base64,${fileBase64}`
                } 
              }
            ] 
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );
    
    // Parse the response
    const aiResponse = response.data.choices[0].message.content;
    
    // Extract JSON from response
    const jsonMatch = aiResponse.match(/```json([\s\S]*?)```/) || 
                      aiResponse.match(/{[\s\S]*}/);
    
    if (jsonMatch) {
      const jsonStr = jsonMatch[1] ? jsonMatch[1].trim() : jsonMatch[0].trim();
      return JSON.parse(jsonStr);
    }
    
    throw new Error('No se pudo extraer información estructurada del documento');
  } catch (error) {
    logger.error('Error analyzing with Mistral AI:', error);
    throw error;
  }
};

// Helper function to analyze document with local OCR (simplified mock)
const analyzeWithLocalOCR = async (fileBase64, fileType) => {
  // In a real implementation, this would use Tesseract.js or similar
  logger.info('Using local OCR - returning mock data');
  
  // Return mock data
  return {
    equipments: [
      {
        name: 'HPE ProLiant DL380',
        serialNumber: 'SRV654321',
        partNumber: 'PN123456',
        type: 'Servidor',
        model: 'ProLiant DL380'
      },
      {
        name: 'Juniper EX4300',
        serialNumber: 'SW098765',
        partNumber: 'PN987654',
        type: 'Switch',
        model: 'EX4300'
      }
    ]
  };
};

// Generate a device name
export const generateDeviceName = async (req, res, next) => {
  try {
    const { prefix, datacenter } = req.query;
    
    if (!prefix || !datacenter) {
      return res.status(400).json({ 
        error: true, 
        message: 'Se requieren prefix y datacenter' 
      });
    }
    
    // In a real app, this would probably read from and update a database sequence
    // For simplicity, we'll generate a name based on the current timestamp
    const timestamp = Date.now().toString().slice(-4);
    const deviceName = `${prefix}-${datacenter}-${timestamp}`;
    
    res.json({ deviceName });
  } catch (error) {
    next(error);
  }
};

// Export data to Excel
export const exportToExcel = async (req, res, next) => {
  try {
    const { projectData, equipmentList } = req.body;
    
    if (!projectData || !equipmentList) {
      return res.status(400).json({ 
        error: true, 
        message: 'Se requieren projectData y equipmentList' 
      });
    }
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Add project info sheet
    const projectWs = XLSX.utils.json_to_sheet([projectData]);
    XLSX.utils.book_append_sheet(wb, projectWs, 'Project Info');
    
    // Add equipment list sheet
    const equipmentWs = XLSX.utils.json_to_sheet(equipmentList);
    XLSX.utils.book_append_sheet(wb, equipmentWs, 'Equipment List');
    
    // Create directory if it doesn't exist
    const excelDir = path.join(__dirname, '../../uploads/excel');
    if (!fs.existsSync(excelDir)) {
      fs.mkdirSync(excelDir, { recursive: true });
    }
    
    // Generate filename
    const filename = `${projectData.projectCode || 'project'}-${Date.now()}.xlsx`;
    const filepath = path.join(excelDir, filename);
    
    // Write file
    XLSX.writeFile(wb, filepath);
    
    // Return file URL
    res.json({ 
      filename,
      url: `/uploads/excel/${filename}`,
      message: 'Excel creado correctamente'
    });
  } catch (error) {
    next(error);
  }
};

// Get current settings
export const getSettings = async (req, res, next) => {
  try {
    const settings = getSettings();
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

// Update settings
export const updateSettings = async (req, res, next) => {
  try {
    const newSettings = req.body;
    const settings = updateSettingsFile(newSettings);
    res.json(settings);
  } catch (error) {
    next(error);
  }
};