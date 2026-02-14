import { useEffect, useState } from "react";
import * as Updates from "expo-updates";
import { Platform } from "react-native";

/**
 * Componente opcional para manejar actualizaciones OTA
 * Úsalo en tu _layout.tsx principal si quieres control manual de updates
 */
export function UpdateManager() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // Solo verificar updates en producción (no en desarrollo)
    if (__DEV__) {
      return;
    }

    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    try {
      setIsChecking(true);
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        setUpdateAvailable(true);
        // Descargar y aplicar la actualización
        await Updates.fetchUpdateAsync();
        // Reiniciar la app para aplicar la actualización
        await Updates.reloadAsync();
      }
    } catch (error) {
      console.error("Error al verificar actualizaciones:", error);
    } finally {
      setIsChecking(false);
    }
  };

  // Este componente no renderiza nada visualmente
  // Las actualizaciones se manejan automáticamente según la configuración en app.json
  return null;
}

/**
 * Hook para verificar manualmente si hay actualizaciones disponibles
 */
export function useUpdates() {
  const [updateInfo, setUpdateInfo] = useState<{
    isAvailable: boolean;
    isChecking: boolean;
    error: Error | null;
  }>({
    isAvailable: false,
    isChecking: false,
    error: null,
  });

  const checkForUpdates = async () => {
    if (__DEV__) {
      console.log("Updates no disponibles en modo desarrollo");
      return;
    }

    try {
      setUpdateInfo((prev) => ({ ...prev, isChecking: true, error: null }));
      const update = await Updates.checkForUpdateAsync();

      setUpdateInfo({
        isAvailable: update.isAvailable,
        isChecking: false,
        error: null,
      });

      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      }
    } catch (error) {
      setUpdateInfo({
        isAvailable: false,
        isChecking: false,
        error: error as Error,
      });
    }
  };

  return {
    ...updateInfo,
    checkForUpdates,
    reload: Updates.reloadAsync,
  };
}

