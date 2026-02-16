import AsyncStorage from "@react-native-async-storage/async-storage";

export interface StoredUser {
  id: string;
  nombre: string;
  usuario: string;
  email_phone: string;
  estado: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Obtiene el usuario actual guardado en el almacenamiento
 */
export const getStoredUser = async (): Promise<StoredUser | null> => {
  try {
    const [id, nombre, usuario, email_phone, estado, createdAt, updatedAt] =
      await AsyncStorage.multiGet([
        "user_id",
        "user_nombre",
        "user_usuario",
        "user_email_phone",
        "user_estado",
        "user_createdAt",
        "user_updatedAt",
      ]);

    if (!id[1]) return null;

    return {
      id: id[1],
      nombre: nombre[1] || "",
      usuario: usuario[1] || "",
      email_phone: email_phone[1] || "",
      estado: estado[1] === "true",
      createdAt: createdAt[1] || "",
      updatedAt: updatedAt[1] || "",
    };
  } catch (error) {
    console.error("Error al obtener usuario guardado:", error);
    return null;
  }
};

/**
 * Obtiene el token guardado
 */
export const getStoredToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem("token");
  } catch (error) {
    console.error("Error al obtener token:", error);
    return null;
  }
};

/**
 * Limpia todos los datos de sesión guardados
 */
export const clearSession = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      "token",
      "user_id",
      "user_usuario",
      "user_nombre",
      "user_email_phone",
      "user_estado",
      "user_createdAt",
      "user_updatedAt",
    ]);
  } catch (error) {
    console.error("Error al limpiar sesión:", error);
  }
};

/**
 * Verifica si hay una sesión válida
 */
export const hasValidSession = async (): Promise<boolean> => {
  try {
    const token = await getStoredToken();
    return !!token;
  } catch (error) {
    console.error("Error al verificar sesión:", error);
    return false;
  }
};
