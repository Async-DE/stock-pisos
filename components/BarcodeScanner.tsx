import { useState, useEffect } from "react";
import { CameraView, useCameraPermissions, BarcodeScanningResult } from "expo-camera";
import { Modal, Pressable, StyleSheet, View, Text, Alert } from "react-native";
import { Box } from "@/components/ui/box";
import { X, ScanLine } from "lucide-react-native";

interface BarcodeScannerProps {
  visible: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}

export function BarcodeScanner({
  visible,
  onClose,
  onScan,
}: BarcodeScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (visible) {
      setScanned(false);
    }
  }, [visible]);

  const handleBarCodeScanned = (result: BarcodeScanningResult) => {
    if (scanned || !result.data) return;
    
    setScanned(true);
    onScan(result.data);
    // Pequeño delay para que el usuario vea que se escaneó
    setTimeout(() => {
      onClose();
    }, 500);
  };

  const handleRequestPermission = async () => {
    const result = await requestPermission();
    if (!result.granted) {
      Alert.alert(
        "Permiso denegado",
        "Se necesita acceso a la cámara para escanear códigos de barras."
      );
      onClose();
    }
  };

  if (!visible) return null;

  if (!permission) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Box className="bg-white rounded-lg p-6 m-4">
            <Text className="text-lg font-semibold mb-4">
              Cargando permisos...
            </Text>
          </Box>
        </View>
      </Modal>
    );
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Box className="bg-white rounded-lg p-6 m-4">
            <Text className="text-lg font-semibold mb-4">
              Permiso de cámara requerido
            </Text>
            <Text className="text-gray-600 mb-4">
              Necesitamos acceso a tu cámara para escanear códigos de barras.
            </Text>
            <Pressable
              onPress={handleRequestPermission}
              className="bg-[#13E000] rounded-lg py-3 px-6 mt-2"
            >
              <Text className="text-white text-center font-semibold">
                Conceder permiso
              </Text>
            </Pressable>
            <Pressable
              onPress={onClose}
              className="bg-gray-300 rounded-lg py-3 px-6 mt-2"
            >
              <Text className="text-gray-700 text-center font-semibold">
                Cancelar
              </Text>
            </Pressable>
          </Box>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.container}>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: [
              "ean13",
              "ean8",
              "upc_a",
              "upc_e",
              "code128",
              "code39",
              "code93",
              "itf14",
              "codabar",
            ],
          }}
        >
          <View style={styles.overlay}>
            {/* Botón de cerrar */}
            <Pressable
              onPress={onClose}
              style={styles.closeButton}
              className="bg-black/50 rounded-full p-2"
            >
              <X size={24} color="#FFFFFF" />
            </Pressable>

            {/* Área de escaneo */}
            <View style={styles.scanArea}>
              <View style={styles.scanFrame}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
                <ScanLine size={200} color="#13E000" strokeWidth={2} />
              </View>
              <Text style={styles.instructionText}>
                Coloca el código de barras dentro del marco
              </Text>
            </View>
          </View>
        </CameraView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
  },
  scanArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrame: {
    width: 250,
    height: 200,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: "#13E000",
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  instructionText: {
    color: "#FFFFFF",
    fontSize: 16,
    marginTop: 30,
    textAlign: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});

