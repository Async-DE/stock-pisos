import { useEffect, useState } from "react";
import { Alert, Modal, View, ActivityIndicator } from "react-native";
import * as Updates from "expo-updates";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";

export function UpdateChecker() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    try {
      // Solo verificar actualizaciones en producción (no en desarrollo)
      if (__DEV__ || !Updates.isEnabled) {
        setChecking(false);
        return;
      }

      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        setUpdateAvailable(true);
        setChecking(false);
        // Mostrar alerta obligatoria
        showUpdateAlert();
      } else {
        setChecking(false);
      }
    } catch (error) {
      console.error("Error verificando actualizaciones:", error);
      setChecking(false);
    }
  };

  const showUpdateAlert = () => {
    Alert.alert(
      "Actualización disponible",
      "Hay una nueva versión de la aplicación disponible. Debes descargarla para continuar.",
      [
        {
          text: "Descargar ahora",
          onPress: downloadAndApplyUpdate,
          style: "default",
        },
      ],
      { cancelable: false } // No permite cancelar
    );
  };

  const downloadAndApplyUpdate = async () => {
    try {
      setDownloading(true);

      // Descargar la actualización
      await Updates.fetchUpdateAsync();

      setDownloaded(true);
      setDownloading(false);

      // Mostrar alerta de confirmación y reiniciar
      Alert.alert(
        "Actualización descargada",
        "La actualización se ha descargado correctamente. La aplicación se reiniciará ahora.",
        [
          {
            text: "Reiniciar",
            onPress: async () => {
              await Updates.reloadAsync();
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error("Error descargando actualización:", error);
      setDownloading(false);
      Alert.alert(
        "Error",
        "No se pudo descargar la actualización. Por favor, verifica tu conexión a internet e intenta nuevamente.",
        [
          {
            text: "Reintentar",
            onPress: downloadAndApplyUpdate,
          },
        ]
      );
    }
  };

  // Mostrar modal de descarga si está descargando
  if (downloading || downloaded) {
    return (
      <Modal
        visible={true}
        transparent={true}
        animationType="fade"
        statusBarTranslucent
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box className="bg-black rounded-lg p-6 mx-4 items-center min-w-[280px]">
            {downloading ? (
              <>
                <ActivityIndicator size="large" color="#13E000" />
                <Text className="text-white text-lg font-semibold mt-4 text-center">
                  Descargando actualización...
                </Text>
                <Text className="text-gray-400 text-sm mt-2 text-center">
                  Por favor espera
                </Text>
              </>
            ) : (
              <>
                <Text className="text-white text-lg font-semibold mt-4 text-center">
                  Actualización descargada
                </Text>
                <Text className="text-gray-400 text-sm mt-2 text-center">
                  Reiniciando aplicación...
                </Text>
              </>
            )}
          </Box>
        </View>
      </Modal>
    );
  }

  return null;
}

