import { Project, Equipment, EstimatedEquipment, Incident } from '../types';
import { exportExcelFile as exportExcelFileFromService } from '../services/fileService';

export const exportExcelFile = exportExcelFileFromService;

export const generateProjectCode = (
  datacenter: string,
  client: string,
  ritmCode: string,
  projectName: string
): string => {
  const datacenterInitial = datacenter.charAt(0).toUpperCase();
  
  let ritmWithoutLeadingZeros = '';
  for (let i = 0; i < ritmCode.length; i++) {
    if (ritmCode[i] !== '0' || ritmWithoutLeadingZeros.length > 0) {
      ritmWithoutLeadingZeros += ritmCode[i];
    }
  }
  
  return `${datacenterInitial}-${client}-${ritmWithoutLeadingZeros}-${projectName}`.replace(/\s+/g, '');
};

export const calculateProjectProgress = (project: Project): number => {
  if (!project.orders || project.orders.length === 0) return 0;
  
  let verifiedEquipment = 0;
  let totalEstimatedEquipment = project.estimatedEquipment;

  project.orders.forEach(order => {
    order.deliveryNotes.forEach(note => {
      verifiedEquipment += note.verifiedEquipment;
    });
  });

  return totalEstimatedEquipment > 0 
    ? Math.round((verifiedEquipment / totalEstimatedEquipment) * 100) 
    : 0;
};

export const calculateOrderProgress = (order: any): number => {
  if (!order.deliveryNotes || order.deliveryNotes.length === 0) return 0;
  
  let verifiedEquipment = 0;
  order.deliveryNotes.forEach((note: any) => {
    verifiedEquipment += note.verifiedEquipment;
  });

  return order.estimatedEquipment > 0 
    ? Math.round((verifiedEquipment / order.estimatedEquipment) * 100) 
    : 0;
};

export const calculateDeliveryNoteProgress = (deliveryNote: any): number => {
  return deliveryNote.estimatedEquipment > 0 
    ? Math.round((deliveryNote.verifiedEquipment / deliveryNote.estimatedEquipment) * 100) 
    : 0;
};

export const getMistralAIPrompt = (): string => {
  return `
  Tu tarea es analizar documentos de albaranes de entrega para equipos de datacenter.
  
  Extrae la siguiente información de cada equipo listado en el documento:
  1. Nombre o identificador del equipo
  2. Número de serie (si está disponible)
  3. Número de parte (si está disponible)
  4. Tipo de equipo (servidor, switch, router, storage, etc.)
  5. Modelo del equipo
  
  Organiza la información en formato JSON con la siguiente estructura:
  {
    "equipments": [
      {
        "name": "string",
        "serialNumber": "string",
        "partNumber": "string",
        "type": "string",
        "model": "string"
      }
    ]
  }
  
  Si alguna información no está disponible, devuelve una cadena vacía para ese campo.
  Asegúrate de identificar correctamente todos los equipos listados en el documento.
  `;
};

export const generateUniqueId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

export const getNextDeviceName = (prefix: string, datacenter: string, lastNumber: number): string => {
  const newNumber = lastNumber + 1;
  return `${prefix}-${datacenter}-${newNumber.toString().padStart(4, '0')}`;
};

export const formatDate = (date: string): string => {
  const d = new Date(date);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
};

export const getIncidentsByDeliveryNoteId = (incidents: Incident[], deliveryNoteId: string, equipments: Equipment[]): Incident[] => {
  const equipmentIds = equipments.map(equipment => equipment.id);
  
  return incidents.filter(incident => 
    equipmentIds.includes(incident.equipmentId)
  );
};

export const getIncidentsByOrderId = (
  incidents: Incident[], 
  order: any
): Incident[] => {
  const equipmentIds: string[] = [];
  
  if (order && order.deliveryNotes) {
    order.deliveryNotes.forEach((note: any) => {
      if (note.equipments) {
        note.equipments.forEach((equipment: Equipment) => {
          equipmentIds.push(equipment.id);
        });
      }
    });
  }
  
  return incidents.filter(incident => 
    equipmentIds.includes(incident.equipmentId)
  );
};

export const getIncidentsByProjectId = (
  incidents: Incident[],
  project: any
): Incident[] => {
  const equipmentIds: string[] = [];
  
  if (project && project.orders) {
    project.orders.forEach((order: any) => {
      if (order.deliveryNotes) {
        order.deliveryNotes.forEach((note: any) => {
          if (note.equipments) {
            note.equipments.forEach((equipment: Equipment) => {
              equipmentIds.push(equipment.id);
            });
          }
        });
      }
    });
  }
  
  return incidents.filter(incident => 
    equipmentIds.includes(incident.equipmentId)
  );
};