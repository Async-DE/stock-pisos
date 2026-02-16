import { Alert } from "react-native";

/**
 * Muestra una notificación de éxito
 */
export const showSuccess = (message: string, title: string = "Éxito") => {
  Alert.alert(title, message);
};

/**
 * Muestra una notificación de error
 */
export const showError = (message: string, title: string = "Error") => {
  Alert.alert(title, message);
};

/**
 * Muestra una notificación de información
 */
export const showInfo = (message: string, title: string = "Información") => {
  Alert.alert(title, message);
};

/**
 * Muestra una notificación de confirmación
 */
export const showConfirm = (
  message: string,
  onConfirm: () => void,
  title: string = "Confirmar",
  confirmText: string = "Aceptar",
  cancelText: string = "Cancelar"
) => {
  Alert.alert(title, message, [
    {
      text: cancelText,
      style: "cancel",
    },
    {
      text: confirmText,
      onPress: onConfirm,
    },
  ]);
};

