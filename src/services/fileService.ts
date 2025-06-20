import * as XLSX from 'xlsx';
import { EstimatedEquipment } from '../types';
import { parseExcelWithJS, parseExcelWithAI } from './excelService';
import { useSettingsStore } from '../store/settingsStore';
import { apiService } from './apiService';

export const readExcelFile = async (file: File): Promise<{ equipmentList: EstimatedEquipment[], projectData: any }> => {
  const { settings } = useSettingsStore.getState();
  
  if (settings.excelParserMethod === 'javascript') {
    return parseExcelWithJS(file);
  } else {
    return parseExcelWithAI(file);
  }
};

export const exportExcelFile = async (projectData: any, equipmentList: any[]): Promise<void> => {
  const { settings } = useSettingsStore.getState();
  
  try {
    if (settings.demoMode) {
      const wb = XLSX.utils.book_new();
      
      const projectWs = XLSX.utils.json_to_sheet([projectData]);
      XLSX.utils.book_append_sheet(wb, projectWs, 'Project Info');
      
      const equipmentWs = XLSX.utils.json_to_sheet(equipmentList);
      XLSX.utils.book_append_sheet(wb, equipmentWs, 'Equipment List');
      
      XLSX.writeFile(wb, `${projectData.projectCode || 'project'}.xlsx`);
    } else {
      const result = await apiService.exportToExcel(projectData, equipmentList);
      
      if (result.url) {
        window.open(result.url, '_blank');
      }
    }
  } catch (error) {
    console.error('Error exporting Excel file:', error);
    throw error;
  }
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const createImageFromCamera = (stream: MediaStream): Promise<string> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.srcObject = stream;
    video.play();
    
    video.onloadedmetadata = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        resolve(dataUrl);
      }
      
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
    };
  });
};