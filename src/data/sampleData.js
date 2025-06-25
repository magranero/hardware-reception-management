import { Project, Order, DeliveryNote, Equipment, EstimatedEquipment, Incident, IncidentComment } from '../types';
import { generateUniqueId } from '../utils/helpers';

// Helper function to create a date string for a specific number of days in the past or future
const getDateString = (daysOffset: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString();
};

// Sample estimated equipment lists for projects
const createEstimatedEquipment = (projectId: string): EstimatedEquipment[] => [
  {
    id: generateUniqueId(),
    projectId,
    type: 'Servidor',
    model: 'Dell PowerEdge R740',
    quantity: 10,
    assignedEquipmentCount: 7
  },
  {
    id: generateUniqueId(),
    projectId,
    type: 'Servidor',
    model: 'HPE ProLiant DL380',
    quantity: 5,
    assignedEquipmentCount: 3
  },
  {
    id: generateUniqueId(),
    projectId,
    type: 'Switch',
    model: 'Cisco Nexus 9336C-FX2',
    quantity: 4,
    assignedEquipmentCount: 2
  },
  {
    id: generateUniqueId(),
    projectId,
    type: 'Router',
    model: 'Cisco 8300 Series',
    quantity: 2,
    assignedEquipmentCount: 1
  },
  {
    id: generateUniqueId(),
    projectId,
    type: 'Storage',
    model: 'NetApp AFF A400',
    quantity: 2,
    assignedEquipmentCount: 0
  }
];

// Create equipments for delivery notes
const createEquipments = (deliveryNoteId: string, count: number, estimatedEquipmentId: string | null = null): Equipment[] => {
  const equipments: Equipment[] = [];
  
  for (let i = 1; i <= count; i++) {
    const isMatched = !!estimatedEquipmentId;
    const isVerified = Math.random() > 0.3 && isMatched;
    
    equipments.push({
      id: generateUniqueId(),
      deliveryNoteId,
      name: `Dell PowerEdge R740 #${i}`,
      serialNumber: `SN${Math.floor(10000 + Math.random() * 90000)}`,
      partNumber: `PN${Math.floor(10000 + Math.random() * 90000)}`,
      deviceName: `SRV-MAD-${1000 + i}`,
      type: 'Servidor',
      model: 'Dell PowerEdge R740',
      isVerified,
      photoPath: isVerified ? 'https://images.unsplash.com/photo-1591405351990-4726e331f141?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' : null,
      isMatched,
      matchedWithId: estimatedEquipmentId,
      estimatedEquipmentId
    });
  }
  
  return equipments;
};

// Sample delivery notes
const createDeliveryNotes = (orderId: string): DeliveryNote[] => {
  const notes: DeliveryNote[] = [];
  const equipmentId1 = generateUniqueId();
  const equipmentId2 = generateUniqueId();
  
  // First delivery note - completed
  const note1: DeliveryNote = {
    id: generateUniqueId(),
    code: `ALB-2025-${Math.floor(1000 + Math.random() * 9000)}`,
    orderId,
    estimatedEquipment: 5,
    deliveredEquipment: 5,
    verifiedEquipment: 5,
    status: 'Completado',
    progress: 100,
    attachmentPath: 'documento_albaran.pdf',
    attachmentType: 'pdf',
    equipments: createEquipments(generateUniqueId(), 5, equipmentId1)
  };
  
  // Second delivery note - in progress (validating reception)
  const note2: DeliveryNote = {
    id: generateUniqueId(),
    code: `ALB-2025-${Math.floor(1000 + Math.random() * 9000)}`,
    orderId,
    estimatedEquipment: 7,
    deliveredEquipment: 7,
    verifiedEquipment: 3,
    status: 'Validando Recepción',
    progress: 43,
    attachmentPath: 'documento_albaran2.xlsx',
    attachmentType: 'excel',
    equipments: createEquipments(generateUniqueId(), 7, equipmentId2)
  };
  
  // Third delivery note - just started (validating against estimated equipment)
  const note3: DeliveryNote = {
    id: generateUniqueId(),
    code: `ALB-2025-${Math.floor(1000 + Math.random() * 9000)}`,
    orderId,
    estimatedEquipment: 10,
    deliveredEquipment: 10,
    verifiedEquipment: 0,
    status: 'Validando Albarán',
    progress: 0,
    attachmentPath: 'documento_albaran3.jpg',
    attachmentType: 'image',
    equipments: createEquipments(generateUniqueId(), 10)
  };
  
  notes.push(note1, note2, note3);
  return notes;
};

// Sample orders
const createOrders = (projectId: string): Order[] => {
  const orders: Order[] = [];
  
  // First order - high progress
  const order1: Order = {
    id: generateUniqueId(),
    code: `ORD-2025-${Math.floor(1000 + Math.random() * 9000)}`,
    projectId,
    estimatedEquipment: 12,
    progress: 75,
    deliveryNotes: createDeliveryNotes(generateUniqueId())
  };
  
  // Second order - medium progress
  const order2: Order = {
    id: generateUniqueId(),
    code: `ORD-2025-${Math.floor(1000 + Math.random() * 9000)}`,
    projectId,
    estimatedEquipment: 8,
    progress: 45,
    deliveryNotes: createDeliveryNotes(generateUniqueId())
  };
  
  // Third order - just created, no progress
  const order3: Order = {
    id: generateUniqueId(),
    code: `ORD-2025-${Math.floor(1000 + Math.random() * 9000)}`,
    projectId,
    estimatedEquipment: 15,
    progress: 0,
    deliveryNotes: []
  };
  
  orders.push(order1, order2, order3);
  return orders;
};

// Sample comments for incidents
const createComments = (count: number): IncidentComment[] => {
  const comments: IncidentComment[] = [];
  
  for (let i = 0; i < count; i++) {
    comments.push({
      id: generateUniqueId(),
      date: getDateString(-10 + i * 2), // Comments spaced out by 2 days
      text: `Comentario de seguimiento #${i+1}. ${i === 0 ? 'Se ha iniciado la investigación.' : i === count-1 ? 'Se ha encontrado una solución.' : 'Se continúa trabajando en el problema.'}`,
      author: 'Técnico de Datacenter',
      photoPath: i % 2 === 0 ? 'https://images.unsplash.com/photo-1591405351990-4726e331f141?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' : null
    });
  }
  
  return comments;
};

// Sample projects
export const sampleProjects: Project[] = [
  // Project 1 - In progress, high completion
  {
    id: generateUniqueId(),
    deliveryDate: getDateString(15),
    datacenter: 'MAD',
    projectName: 'Ampliación Datacenter Madrid',
    client: 'Telefónica',
    ritmCode: 'RITM00012345',
    projectCode: 'M-Telefónica-12345-AmpliaciónDatacenterMadrid',
    estimatedEquipment: 23,
    status: 'En Progreso',
    progress: 72,
    teamsUrl: 'https://teams.microsoft.com/channel/123456',
    excelPath: 'proyecto_telefonica.xlsx',
    createdAt: getDateString(-30),
    orders: createOrders(generateUniqueId()),
    estimatedEquipmentList: createEstimatedEquipment(generateUniqueId()),
    ocrMethod: 'mistral'
  },
  
  // Project 2 - Just started
  {
    id: generateUniqueId(),
    deliveryDate: getDateString(45),
    datacenter: 'BCN',
    projectName: 'Renovación Servidores Barcelona',
    client: 'Santander',
    ritmCode: 'RITM00023456',
    projectCode: 'B-Santander-23456-RenovaciónServidoresBarcelona',
    estimatedEquipment: 35,
    status: 'En Progreso',
    progress: 20,
    teamsUrl: 'https://teams.microsoft.com/channel/234567',
    excelPath: 'proyecto_santander.xlsx',
    createdAt: getDateString(-15),
    orders: createOrders(generateUniqueId()),
    estimatedEquipmentList: createEstimatedEquipment(generateUniqueId()),
    ocrMethod: 'scribe'
  },
  
  // Project 3 - Completed
  {
    id: generateUniqueId(),
    deliveryDate: getDateString(-10),
    datacenter: 'PAR',
    projectName: 'Despliegue CDN París',
    client: 'Orange',
    ritmCode: 'RITM00034567',
    projectCode: 'P-Orange-34567-DespliegeCDNParís',
    estimatedEquipment: 18,
    status: 'Completado',
    progress: 100,
    teamsUrl: 'https://teams.microsoft.com/channel/345678',
    excelPath: 'proyecto_orange.xlsx',
    createdAt: getDateString(-60),
    orders: createOrders(generateUniqueId()),
    estimatedEquipmentList: createEstimatedEquipment(generateUniqueId()),
    ocrMethod: 'mistral'
  },
  
  // Project 4 - Pending, not started
  {
    id: generateUniqueId(),
    deliveryDate: getDateString(90),
    datacenter: 'FRA',
    projectName: 'Nuevo Cluster Frankfurt',
    client: 'Deutsche Telekom',
    ritmCode: 'RITM00045678',
    projectCode: 'F-DeutscheTelekom-45678-NuevoClusterFrankfurt',
    estimatedEquipment: 50,
    status: 'Pendiente',
    progress: 0,
    teamsUrl: 'https://teams.microsoft.com/channel/456789',
    excelPath: 'proyecto_deutsche.xlsx',
    createdAt: getDateString(-5),
    orders: [],
    estimatedEquipmentList: createEstimatedEquipment(generateUniqueId()),
    ocrMethod: 'scribe'
  },
];

// Sample incidents
export const sampleIncidents: Incident[] = [
  {
    id: 'inc123456',
    equipmentId: 'eq123',
    description: 'Equipo recibido con daños en la carcasa. Presenta golpes en la parte frontal del servidor.',
    status: 'Pendiente',
    createdAt: getDateString(-5),
    photoPath: 'https://images.unsplash.com/photo-1591405351990-4726e331f141?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    comments: []
  },
  {
    id: 'inc789012',
    equipmentId: 'eq456',
    description: 'Falta un disco duro que venía especificado en el albarán. El espacio está vacío.',
    status: 'En Revisión',
    createdAt: getDateString(-10),
    photoPath: 'https://images.unsplash.com/photo-1597852074816-d933c7d2b988?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    comments: createComments(2)
  },
  {
    id: 'inc345678',
    equipmentId: 'eq789',
    description: 'El switch presenta un puerto Ethernet dañado. No se puede conectar el cable correctamente.',
    status: 'Resuelto',
    createdAt: getDateString(-20),
    photoPath: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    comments: createComments(3),
    resolution: {
      date: getDateString(-18),
      description: 'Se ha sustituido el switch por uno nuevo. El proveedor ha enviado un reemplazo.',
      technician: 'Carlos Rodríguez'
    }
  },
  {
    id: 'inc901234',
    equipmentId: 'eq012',
    description: 'Servidor recibido con versión de firmware incorrecta. Necesita actualización antes de instalación.',
    status: 'Pendiente',
    createdAt: getDateString(-2),
    photoPath: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    comments: []
  },
  {
    id: 'inc567890',
    equipmentId: 'eq345',
    description: 'Faltan tornillos de montaje para los raíles del servidor. No se puede instalar en el rack.',
    status: 'En Revisión',
    createdAt: getDateString(-8),
    photoPath: 'https://images.unsplash.com/photo-1597852074816-d933c7d2b988?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    comments: createComments(1)
  }
];