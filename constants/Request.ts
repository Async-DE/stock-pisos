import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { toast } from "sonner";

export const baseUrl = `${process.env.EXPO_PUBLIC_URL}`;

const request = async (url: string, method: string, body?: any) => {

  const hasJsonBody = body !== undefined && method !== "GET";

  const response = await fetch(`${baseUrl}${url}`, {
    method,
    body: hasJsonBody ? JSON.stringify(body) : undefined,
    headers: hasJsonBody
      ? {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${await AsyncStorage.getItem("token")}`,
        }
      : {
          "Authorization": `Bearer ${await AsyncStorage.getItem("token")}`,
        },
    credentials: "include",
  });

const data = await response.json();

// respuesta de la API, ejemplo:
// {
//   "message": "Operación realizada exitosamente",
//   "data": {
//     "id": 1,
//     "name": "John Doe"
//   }
// }

    if (response.status === 200) {
      
        const successMessage = data.message || "Operación realizada exitosamente";
        
        toast.success(successMessage, {
        description: "Operación realizada exitosamente",
    });
  }
else if (response.status >= 400) {
        
        const errorMessage = data.message || "Ha ocurrido un error en la solicitud";
        
    toast.error(errorMessage, {
      description: "Error del servidor",
    });
  }

  return { status: response.status, data };
};

const uploadRequest = async (url: string, formData: FormData) => {
  const response = await fetch(`${baseUrl}${url}`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });
    
    const rawText = await response.text();
    console.log("RESPONSE_UPLOAD", {
      status: response.status,
      rawPreview: rawText.slice(0, 300),
    });

    let data: any = {};
    try {
      data = rawText ? JSON.parse(rawText) : {};
    } catch (e) {
      console.log("No es JSON en uploadRequest, probablemente HTML:", e);
      data = { message: rawText };
    }

// respuesta de la API, ejemplo:
// {
//   "message": "Operación realizada exitosamente",
//   "data": {
//     "id": 1,
//     "name": "John Doe"
//   }
// }

    if (response.status === 200 || response.status === 201) {
      
        const successMessage = data.message || "Operación realizada exitosamente";
        
        toast.success(successMessage, {
        description: "Operación realizada exitosamente",
    });
  }
    else if (response.status >= 400) {
        
        const errorMessage = data.message || "Ha ocurrido un error en la solicitud";
        
    toast.error(errorMessage, {
      description: "Error del servidor",
    });
  }

  return { status: response.status, data };
};

export { request, uploadRequest };