import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Role = 'dherru' | 'nivi' | null;

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
  clearRole: () => void;
  otherRole: Role;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

const ROLE_STORAGE_KEY = 'nivis-thursday-role';

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>(null);

  useEffect(() => {
    const stored = localStorage.getItem(ROLE_STORAGE_KEY);
    if (stored === 'dherru' || stored === 'nivi') {
      setRoleState(stored);
    }
  }, []);

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    if (newRole) {
      localStorage.setItem(ROLE_STORAGE_KEY, newRole);
    }
  };

  const clearRole = () => {
    setRoleState(null);
    localStorage.removeItem(ROLE_STORAGE_KEY);
  };

  const otherRole: Role = role === 'dherru' ? 'nivi' : role === 'nivi' ? 'dherru' : null;

  return (
    <RoleContext.Provider value={{ role, setRole, clearRole, otherRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
