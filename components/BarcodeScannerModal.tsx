import { useEffect, useState } from "react";
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  Platform,
} from "react-native";
import { Text } from "@/components/ui/text";
import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import {
  CameraView,
  useCameraPermissions,
  type BarcodeScanningResult,
} from "expo-camera";
import { X, Camera } from "lucide-react-native";

type BarcodeScannerModalProps = {
  visible: boolean;
  onClose: () => void;
  onScanned: (code: string) => void;
  title?: string;
};

export function BarcodeScannerModal({
  visible,
  onClose,
  onScanned,
  title = "Escanear código de barras",
}: BarcodeScannerModalProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [hasScanned, setHasScanned] = useState(false);

  useEffect(() => {
    if (visible) {
      setHasScanned(false);
    }
  }, [visible]);

  if (!visible) {
    return null;
  }

  const handleBarCodeScanned = (result: BarcodeScanningResult) => {
    if (hasScanned) return;
    if (!result?.data) return;

    setHasScanned(true);
    try {
      onScanned(String(result.data));
    } finally {
      // Dar un pequeño tiempo para que el usuario vea que se escaneó algo
      setTimeout(() => {
        onClose();
      }, 400);
    }
  };

  const renderContent = () => {
    if (!permission) {
      return (
        <Center className="flex-1 bg-black/80 px-4">
          <Text className="text-white text-base mb-2">
            Preparando cámara...
          </Text>
        </Center>
      );
    }

    if (!permission.granted) {
      return (
        <Center className="flex-1 bg-black/80 px-6">
          <Box className="bg-black/70 rounded-2xl p-5 border border-[#169500]/60 w-full">
            <Text className="text-white text-lg font-semibold mb-3">
              Permiso de cámara requerido
            </Text>
            <Text className="text-gray-300 text-sm mb-4">
              Necesitamos acceso a la cámara para poder escanear códigos de barras.
            </Text>
            <Pressable
              onPress={requestPermission}
              className="bg-[#13E000] rounded-full py-3 items-center"
            >
              <Text className="text-black font-semibold">
                Conceder permiso de cámara
              </Text>
            </Pressable>
            <Pressable
              onPress={onClose}
              className="mt-3 items-center"
            >
              <Text className="text-gray-400 text-sm">
                Cancelar
              </Text>
            </Pressable>
          </Box>
        </Center>
      );
    }

    return (
      <View style={styles.fullscreen}>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: [
              "ean13",
              "ean8",
              "upc_e",
              "upc_a",
              "code128",
              "code39",
              "code93",
              "qr",
            ],
          }}
        />

        {/* Overlay superior con título y botón cerrar */}
        <View style={styles.topOverlay}>
          <Box className="flex-1" />
          <Box className="flex-row items-center justify-between px-4">
            <Text className="text-white text-lg font-semibold">
              {title}
            </Text>
            <Pressable
              onPress={onClose}
              hitSlop={10}
              className="ml-3"
            >
              <X size={24} color="#FFFFFF" />
            </Pressable>
          </Box>
          <Box className="flex-1" />
        </View>

        {/* Marco de guía para el escaneo */}
        <View style={styles.centerOverlay}>
          <View style={styles.scanFrame} />
        </View>

        {/* Instrucciones inferiores */}
        <View style={styles.bottomOverlay}>
          <Box className="bg-black/65 rounded-2xl px-4 py-3 mx-4 border border-[#169500]/70 flex-row items-center">
            <Camera size={20} color="#13E000" />
            <Text className="text-gray-100 text-sm ml-2 flex-1">
              Apunta la cámara al código de barras o QR del producto.
            </Text>
          </Box>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
    >
      <View style={styles.modalBackground}>
        {renderContent()}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
  },
  fullscreen: {
    flex: 1,
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  topOverlay: {
    position: "absolute",
    top: Platform.OS === "android" ? 40 : 60,
    left: 0,
    right: 0,
    paddingVertical: 4,
  },
  centerOverlay: {
    position: "absolute",
    top: "25%",
    left: 0,
    right: 0,
    bottom: "25%",
    alignItems: "center",
    justifyContent: "center",
  },
  scanFrame: {
    width: "70%",
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: "#13E000",
    backgroundColor: "transparent",
  },
  bottomOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: Platform.OS === "android" ? 40 : 60,
  },
});


