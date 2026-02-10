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
        }
      : undefined,
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

    if (response.status === 200 || response.status === 201) {
      
        const successMessage = data.message || "Operación realizada exitosamente";
        
        toast.success(successMessage, {
        description: "Operación realizada exitosamente",
    });
  }
else if (response.status >= 400 && response.status < 500) {
        
        const errorMessage = data.message || "Ha ocurrido un error en la solicitud";
        
    toast.error(errorMessage, {
      description: "Error del servidor",
    });
  }

  return { status: response.status, ...data };
};

const uploadRequest = async (url: string, formData: FormData) => {
  const response = await fetch(`${baseUrl}${url}`, {
    method: "POST",
    body: formData,
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

  return { status: response.status, ...data };
};

export { request, uploadRequest };