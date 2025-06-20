import * as XLSX from 'xlsx';
import { EstimatedEquipment } from '../types';
import { analyzeDocumentWithAI } from './aiService';
import { getMistralAIPrompt } from '../utils/helpers';

/**
 * Parse Excel file using JavaScript (XLSX library)
 */
export const parseExcelWithJS = async (file: File): Promise<{ equipmentList: EstimatedEquipment[], projectData: any }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const projectInfoSheet = workbook.Sheets[workbook.SheetNames[0]];
        const projectData = XLSX.utils.sheet_to_json(projectInfoSheet);
        
        let equipmentList: EstimatedEquipment[] = [];
        if (workbook.SheetNames.length > 1) {
          const equipmentSheet = workbook.Sheets[workbook.SheetNames[1]];
          const rawEquipmentList = XLSX.utils.sheet_to_json(equipmentSheet);
          
          equipmentList = rawEquipmentList.map((item: any) => ({
            id: '',
            projectId: '',
            type: item.Type || '',
            model: item.Model || '',
            quantity: parseInt(item.Quantity || '0', 10),
            assignedEquipmentCount: 0
          }));
        }
        
        resolve({ equipmentList, projectData: projectData[0] || {} });
      } catch (error) {
        console.error("Error parsing Excel with JS:", error);
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Parse Excel file using AI
 */
export const parseExcelWithAI = async (file: File): Promise<{ equipmentList: EstimatedEquipment[], projectData: any }> => {
  try {
    const reader = new FileReader();
    const fileBase64 = await new Promise<string>((resolve, reject) => {
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    
    const prompt = getMistralAIPrompt();
    const equipments = await analyzeDocumentWithAI(fileBase64, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', prompt);
    
    const projectData = {
      RITM: 'RITM' + Math.floor(10000 + Math.random() * 90000),
      ProjectName: 'Proyecto Analizado por IA',
      Client: 'Cliente',
      Datacenter: 'MAD',
      DeliveryDate: new Date().toISOString().split('T')[0],
      TeamsUrl: 'https://teams.microsoft.com/'
    };
    
    const equipmentList: EstimatedEquipment[] = equipments.reduce((acc: EstimatedEquipment[], equipment) => {
      const existingEquipment = acc.find(
        e => e.type.toLowerCase() === equipment.type.toLowerCase() && 
             e.model.toLowerCase() === equipment.model.toLowerCase()
      );
      
      if (existingEquipment) {
        existingEquipment.quantity += 1;
      } else {
        acc.push({
          id: '',
          projectId: '',
          type: equipment.type || 'Desconocido',
          model: equipment.model || 'Desconocido',
          quantity: 1,
          assignedEquipmentCount: 0
        });
      }
      
      return acc;
    }, []);
    
    return { equipmentList, projectData };
  } catch (error) {
    console.error("Error parsing Excel with AI:", error);
    return parseExcelWithJS(file);
  }
};