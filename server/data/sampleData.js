// Re-export the sample data from the frontend for consistency in demo mode
export { sampleProjects, sampleIncidents } from '../../src/data/sampleData.js';

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