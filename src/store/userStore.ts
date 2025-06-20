import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserGroup, UserRole, Permission } from '../types';
import { generateUniqueId } from '../utils/helpers';

interface UserState {
  currentUser: User | null;
  users: User[];
  userGroups: UserGroup[];
  
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  addUser: (user: Omit<User, 'id'>) => string;
  updateUser: (userId: string, userData: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  
  addUserGroup: (groupData: Omit<UserGroup, 'id'>) => string;
  updateUserGroup: (groupId: string, groupData: Partial<UserGroup>) => void;
  deleteUserGroup: (groupId: string) => void;
  
  assignUserToGroup: (userId: string, groupId: string) => void;
}

// Sample permissions
const samplePermissions: Permission[] = [
  { id: 'perm1', name: 'projects.view', description: 'Ver proyectos', resource: 'projects', action: 'read' },
  { id: 'perm2', name: 'projects.edit', description: 'Editar proyectos', resource: 'projects', action: 'update' },
  { id: 'perm3', name: 'projects.create', description: 'Crear proyectos', resource: 'projects', action: 'create' },
  { id: 'perm4', name: 'incidents.view', description: 'Ver incidencias', resource: 'incidents', action: 'read' },
  { id: 'perm5', name: 'incidents.manage', description: 'Gestionar incidencias', resource: 'incidents', action: 'manage' },
  { id: 'perm6', name: 'users.manage', description: 'Gestionar usuarios', resource: 'users', action: 'manage' },
  { id: 'perm7', name: 'settings.manage', description: 'Gestionar ajustes', resource: 'settings', action: 'manage' },
];

// Sample user groups
const sampleUserGroups: UserGroup[] = [
  {
    id: 'group1',
    name: 'Administradores',
    description: 'Acceso completo al sistema',
    permissions: samplePermissions,
    memberCount: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 'group2',
    name: 'Técnicos de Datacenter',
    description: 'Gestión de equipos y albaranes',
    permissions: samplePermissions.filter(p => !p.name.includes('users') && !p.name.includes('settings')),
    memberCount: 2,
    createdAt: new Date().toISOString()
  },
  {
    id: 'group3',
    name: 'Supervisores',
    description: 'Supervisión de proyectos e incidencias',
    permissions: samplePermissions.filter(p => p.action === 'read' || p.name.includes('incidents')),
    memberCount: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 'group4',
    name: 'Visualizadores',
    description: 'Solo lectura',
    permissions: samplePermissions.filter(p => p.action === 'read'),
    memberCount: 0,
    createdAt: new Date().toISOString()
  }
];

// Sample users
const sampleUsers: User[] = [
  {
    id: 'user1',
    name: 'Administrador del Sistema',
    email: 'admin@datacenter.com',
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
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    role: 'technician',
    department: 'Operaciones',
    location: 'Madrid',
    lastLogin: new Date().toISOString(),
    isActive: true,
    userGroupId: 'group2'
  }
];

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      currentUser: sampleUsers[0], // Default logged-in user for demo
      users: sampleUsers,
      userGroups: sampleUserGroups,
      
      login: async (email, password) => {
        // In a real app, this would validate credentials against a backend
        const user = get().users.find(u => u.email === email && u.isActive);
        
        if (user) {
          // Update last login time
          const updatedUser = { ...user, lastLogin: new Date().toISOString() };
          set(state => ({
            currentUser: updatedUser,
            users: state.users.map(u => u.id === user.id ? updatedUser : u)
          }));
          return updatedUser;
        }
        
        return null;
      },
      
      logout: () => {
        set({ currentUser: null });
      },
      
      addUser: (userData) => {
        const id = generateUniqueId();
        const newUser: User = {
          id,
          ...userData
        };
        
        set(state => ({
          users: [...state.users, newUser],
          userGroups: state.userGroups.map(group => 
            group.id === userData.userGroupId
              ? { ...group, memberCount: group.memberCount + 1 }
              : group
          )
        }));
        
        return id;
      },
      
      updateUser: (userId, userData) => {
        set(state => {
          const user = state.users.find(u => u.id === userId);
          
          // If the user group changed, update the member counts
          if (user && userData.userGroupId && userData.userGroupId !== user.userGroupId) {
            const updatedGroups = state.userGroups.map(group => {
              if (group.id === user.userGroupId) {
                return { ...group, memberCount: Math.max(0, group.memberCount - 1) };
              }
              if (group.id === userData.userGroupId) {
                return { ...group, memberCount: group.memberCount + 1 };
              }
              return group;
            });
            
            return {
              users: state.users.map(u => u.id === userId ? { ...u, ...userData } : u),
              userGroups: updatedGroups,
              currentUser: state.currentUser?.id === userId 
                ? { ...state.currentUser, ...userData }
                : state.currentUser
            };
          }
          
          // Just update the user without changing group membership
          return {
            users: state.users.map(u => u.id === userId ? { ...u, ...userData } : u),
            currentUser: state.currentUser?.id === userId 
              ? { ...state.currentUser, ...userData }
              : state.currentUser
          };
        });
      },
      
      deleteUser: (userId) => {
        set(state => {
          const user = state.users.find(u => u.id === userId);
          
          if (user) {
            // Update group member count
            const updatedGroups = state.userGroups.map(group => 
              group.id === user.userGroupId
                ? { ...group, memberCount: Math.max(0, group.memberCount - 1) }
                : group
            );
            
            return {
              users: state.users.filter(u => u.id !== userId),
              userGroups: updatedGroups
            };
          }
          
          return state;
        });
      },
      
      addUserGroup: (groupData) => {
        const id = generateUniqueId();
        const newGroup: UserGroup = {
          id,
          ...groupData
        };
        
        set(state => ({
          userGroups: [...state.userGroups, newGroup]
        }));
        
        return id;
      },
      
      updateUserGroup: (groupId, groupData) => {
        set(state => ({
          userGroups: state.userGroups.map(g => 
            g.id === groupId ? { ...g, ...groupData } : g
          )
        }));
      },
      
      deleteUserGroup: (groupId) => {
        set(state => ({
          userGroups: state.userGroups.filter(g => g.id !== groupId)
        }));
      },
      
      assignUserToGroup: (userId, groupId) => {
        set(state => {
          const user = state.users.find(u => u.id === userId);
          
          if (user && user.userGroupId !== groupId) {
            // Update user's group
            const updatedUsers = state.users.map(u => 
              u.id === userId ? { ...u, userGroupId: groupId } : u
            );
            
            // Update group member counts
            const updatedGroups = state.userGroups.map(group => {
              if (group.id === user.userGroupId) {
                return { ...group, memberCount: Math.max(0, group.memberCount - 1) };
              }
              if (group.id === groupId) {
                return { ...group, memberCount: group.memberCount + 1 };
              }
              return group;
            });
            
            return {
              users: updatedUsers,
              userGroups: updatedGroups,
              currentUser: state.currentUser?.id === userId 
                ? { ...state.currentUser, userGroupId: groupId }
                : state.currentUser
            };
          }
          
          return state;
        });
      }
    }),
    {
      name: 'datacenter-app-users'
    }
  )
);