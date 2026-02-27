import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type UserRole = "owner" | "admin" | "seller" | "editor";

interface PermissionsContextType {
  role: UserRole | null;
  isLoading: boolean;
  canCreate: boolean;
  canAccessAlmacenamientos: boolean;
  canAccessVentas: boolean;
  canAccessAuditorias: boolean;
  setRole: (role: UserRole | null) => void;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(
  undefined,
);

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar rol desde AsyncStorage al montar
  useEffect(() => {
    const loadRole = async () => {
      try {
        const savedRole = await AsyncStorage.getItem("user_permisos");
        if (
          savedRole &&
          (savedRole === "owner" ||
            savedRole === "admin" ||
            savedRole === "seller" ||
            savedRole === "editor")
        ) {
          setRoleState(savedRole as UserRole);
        }
      } catch (error) {
        console.error("Error cargando permisos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRole();
  }, []);

  const setRole = async (newRole: UserRole | null) => {
    setRoleState(newRole);
    if (newRole) {
      await AsyncStorage.setItem("user_permisos", newRole);
    } else {
      await AsyncStorage.removeItem("user_permisos");
    }
  };

  // Lógica de permisos según el rol
  const canCreate = role === "owner" || role === "admin" || role === "editor";
  const canAccessAlmacenamientos = role === "owner" || role === "admin";
  const canAccessVentas = role === "owner" || role === "admin";
  const canAccessAuditorias = role === "owner";

  const value: PermissionsContextType = {
    role,
    isLoading,
    canCreate,
    canAccessAlmacenamientos,
    canAccessVentas,
    canAccessAuditorias,
    setRole,
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error("usePermissions must be used within a PermissionsProvider");
  }
  return context;
}
