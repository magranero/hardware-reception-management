// Re-export the sample data from the frontend for consistency in demo mode
// Define same sample data directly to avoid cross-importing between frontend and backend

// Sample users for auth
export const sampleUsers = [
  {
    id: 'user1',
    name: 'Administrador del Sistema',
    email: 'admin@datacenter.com',
    // This would be a hashed password in a real app
    passwordHash: 'admin123',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    role: 'admin',
    department: 'IT',
    location: 'Madrid',
    lastLogin: new Date().toISOString(),
    isActive: true,
    userGroupId: 'group1'
  },
  {
    id: 'user2',
    name: 'Técnico de Datacenter',
    email: 'tecnico@datacenter.com',
    passwordHash: 'tecnico123',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    role: 'technician',
    department: 'Operaciones',
    location: 'Barcelona',
    lastLogin: new Date().toISOString(),
    isActive: true,
    userGroupId: 'group2'
  },
  {
    id: 'user3',
    name: 'Supervisor de Proyectos',
    email: 'supervisor@datacenter.com',
    passwordHash: 'supervisor123',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    role: 'manager',
    department: 'Gestión de Proyectos',
    location: 'Madrid',
    lastLogin: new Date().toISOString(),
    isActive: true,
    userGroupId: 'group3'
  },
  {
    id: 'user4',
    name: 'Técnico Junior',
    email: 'junior@datacenter.com',
    passwordHash: 'junior123',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    role: 'technician',
    department: 'Operaciones',
    location: 'Madrid',
    lastLogin: new Date().toISOString(),
    isActive: true,
    userGroupId: 'group2'
  }
];

// Sample projects - using same data structure as frontend but defined independently
export const sampleProjects = [
  // Project 1 - In progress, high completion
  {
    id: 'project1',
    deliveryDate: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString(),
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
    createdAt: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
    orders: [
      {
        id: 'order1',
        code: 'ORD-2025-1234',
        projectId: 'project1',
        estimatedEquipment: 12,
        progress: 75,
        deliveryNotes: [
          {
            id: 'deliverynote1',
            code: 'ALB-2025-1234',
            orderId: 'order1',
            estimatedEquipment: 5,
            deliveredEquipment: 5,
            verifiedEquipment: 5,
            status: 'Completado',
            progress: 100,
            attachmentPath: 'documento_albaran.pdf',
            attachmentType: 'pdf',
            equipments: [
              {
                id: 'equipment1',
                deliveryNoteId: 'deliverynote1',
                name: 'Dell PowerEdge R740 #1',
                serialNumber: 'SN12345',
                partNumber: 'PN67890',
                deviceName: 'SRV-MAD-1001',
                type: 'Servidor',
                model: 'Dell PowerEdge R740',
                isVerified: true,
                photoPath: 'https://images.unsplash.com/photo-1591405351990-4726e331f141?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
                isMatched: true,
                matchedWithId: 'estimatedequipment1',
                estimatedEquipmentId: 'estimatedequipment1'
              }
            ]
          }
        ]
      }
    ],
    estimatedEquipmentList: [
      {
        id: 'estimatedequipment1',
        projectId: 'project1',
        type: 'Servidor',
        model: 'Dell PowerEdge R740',
        quantity: 10,
        assignedEquipmentCount: 7
      }
    ],
    ocrMethod: 'ai'
  },
  // Project 2 - Just started
  {
    id: 'project2',
    deliveryDate: new Date(new Date().setDate(new Date().getDate() + 45)).toISOString(),
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
    createdAt: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString(),
    orders: [],
    estimatedEquipmentList: [],
    ocrMethod: 'scribe'
  }
];

// Sample incidents
export const sampleIncidents = [
  {
    id: 'inc123456',
    equipmentId: 'equipment1',
    description: 'Equipo recibido con daños en la carcasa. Presenta golpes en la parte frontal del servidor.',
    status: 'Pendiente',
    createdAt: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
    photoPath: 'https://images.unsplash.com/photo-1591405351990-4726e331f141?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    comments: []
  },
  {
    id: 'inc789012',
    equipmentId: 'equipment2',
    description: 'Falta un disco duro que venía especificado en el albarán. El espacio está vacío.',
    status: 'En Revisión',
    createdAt: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
    photoPath: 'https://images.unsplash.com/photo-1597852074816-d933c7d2b988?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    comments: [
      {
        id: 'comment1',
        date: new Date(new Date().setDate(new Date().getDate() - 8)).toISOString(),
        text: 'Comentario de seguimiento #1. Se ha iniciado la investigación.',
        author: 'Técnico de Datacenter',
        photoPath: 'https://images.unsplash.com/photo-1591405351990-4726e331f141?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
      }
    ]
  }
];