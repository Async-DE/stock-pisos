# Stock Pisos

Este proyecto es una aplicación desarrollada en React Native utilizando Expo. A continuación, se describen los pasos mínimos necesarios para ejecutar el proyecto en tu entorno local.

## Requisitos previos

Asegúrate de tener instalados los siguientes programas y herramientas:

1. [Node.js](https://nodejs.org/) (versión 14 o superior).
2. [Expo CLI](https://docs.expo.dev/get-started/installation/) (puedes instalarlo globalmente con `npm install -g expo-cli`).
3. Un emulador de Android/iOS o un dispositivo físico con la aplicación Expo Go instalada.
4. [Git](https://git-scm.com/) para clonar el repositorio.
5. [EAS CLI](https://docs.expo.dev/eas/get-started/) para builds y actualizaciones:
   ```bash
   npm install -g eas-cli
   ```

## Pasos para ejecutar el proyecto

1. **Clonar el repositorio**

   Clona este repositorio en tu máquina local:

   ```bash
   git clone https://github.com/Async-DE/Stock-b.git
   cd stock-pisos
   ```

2. **Instalar dependencias**

   Asegúrate de instalar las dependencias necesarias ejecutando el siguiente comando:

   ```bash
   npm install
   ```

3. **Configurar variables de entorno**

   Si el proyecto utiliza variables de entorno, asegúrate de crear un archivo `.env` en la raíz del proyecto y agregar las variables necesarias. Puedes usar el archivo `example.env` como referencia si está disponible.

4. **Iniciar el servidor de desarrollo**

   Inicia el servidor de desarrollo de Expo con el siguiente comando:

   ```bash
   npx expo start
   ```

5. **Abrir la aplicación en un dispositivo o emulador**

   - Si estás utilizando un dispositivo físico, escanea el código QR que aparece en la terminal o en la página web de Expo con la aplicación Expo Go.
   - Si estás utilizando un emulador, selecciona la opción correspondiente en la página web de Expo o en la terminal.

## Estructura del proyecto

- `app/`: Contiene las pantallas y componentes principales de la aplicación.
- `components/`: Componentes reutilizables de la interfaz de usuario.
- `assets/`: Archivos estáticos como imágenes, íconos y fuentes.
- `constants/`: Archivos de configuración y constantes globales.
- `package.json`: Archivo de configuración de dependencias del proyecto.
- `tsconfig.json`: Configuración de TypeScript.
- `tailwind.config.js`: Configuración de Tailwind CSS.

## Actualizaciones OTA (Over-The-Air)

Este proyecto está configurado para usar **EAS Update** de Expo, que permite publicar actualizaciones de JavaScript y assets sin necesidad de pasar por las tiendas de aplicaciones.

### ✅ Configuración Completada

- ✅ `expo-updates` instalado
- ✅ Configuración en `app.json` para updates
- ✅ Perfiles de build en `eas.json` (development, preview, production)
- ✅ Scripts de npm para publicar updates
- ✅ Channels configurados por perfil (`development`, `preview`, `production`)
- ✅ Runtime version fijo para compatibilidad

### 🔧 Configuración de EAS Update

El proyecto está configurado con:

**app.json:**
```json
{
  "updates": {
    "url": "https://u.expo.dev/279eb238-0660-4b1a-a1d0-6222b8e3fc17",
    "fallbackToCacheTimeout": 0,
    "checkAutomatically": "ON_LOAD"
  },
  "runtimeVersion": "1.0.3"
}
```

**eas.json:**
```json
{
  "build": {
    "development": {
      "channel": "development",
      ...
    },
    "preview": {
      "channel": "preview",
      ...
    },
    "production": {
      "channel": "production",
      ...
    }
  }
}
```

**¿Por qué runtime version fijo?**
- Garantiza que la versión calculada localmente coincida con la de EAS Build
- Evita el error "Runtime version mismatch"
- Debes actualizarlo manualmente cuando cambies la versión de la app

**¿Por qué channels?**
- Permite tener diferentes canales de actualización por entorno
- Los builds de producción solo reciben updates publicados en el canal `production`
- Los builds de desarrollo solo reciben updates del canal `development`

### 🎯 ¿Cómo Funcionan las Actualizaciones OTA?

**Respuesta corta**: **SÍ, puedes seguir actualizando tu app después de compilarla**, pero hay reglas importantes.

#### Escenario 1: Misma Versión de App (1.0.0)

```
1. Compilas la app versión 1.0.0 → Publicas en Play Store/App Store
   ✅ Build creado con runtimeVersion: "1.0.0"

2. Haces cambios en tu código JavaScript/TypeScript
   ✅ Puedes publicar updates OTA ilimitadas

3. Publicas update:
   npm run update:production -- "Nueva funcionalidad"
   ✅ Los usuarios reciben la actualización automáticamente

4. Haces más cambios, publicas otra update
   ✅ Sigue funcionando, sin límite de updates
```

**Conclusión**: Mientras la versión sea `1.0.0`, puedes publicar **ilimitadas actualizaciones OTA**.

#### Escenario 2: Cambias la Versión (1.0.0 → 1.0.1)

```
1. Cambias version en app.json: "1.0.0" → "1.0.1"
   ⚠️ Ahora necesitas un NUEVO build

2. Compilas nuevo build versión 1.0.1
   ✅ Nuevo build con runtimeVersion: "1.0.1"

3. Publicas el nuevo build en las tiendas
   ✅ Los usuarios actualizan desde las tiendas

4. Ahora puedes publicar updates OTA para versión 1.0.1
   ✅ Funciona igual que antes, pero para la nueva versión
```

### ✅ Lo que SÍ puedes actualizar (sin nuevo build)

- ✅ **Código JavaScript/TypeScript** (casi todo tu código)
- ✅ **Componentes React/React Native**
- ✅ **Lógica de negocio**
- ✅ **Pantallas y navegación**
- ✅ **Estilos y UI**
- ✅ **Assets** (imágenes, fuentes, etc.)
- ✅ **Configuración de Expo** (algunas)

**Ejemplos prácticos:**
- Agregar una nueva pantalla
- Cambiar colores o estilos
- Corregir bugs en la lógica
- Agregar nuevas funcionalidades en JavaScript
- Cambiar textos o mensajes
- Modificar flujos de navegación

### ❌ Lo que NO puedes actualizar (requiere nuevo build)

- ❌ **Código nativo** (Java, Kotlin, Swift, Objective-C)
- ❌ **Dependencias nativas** (librerías que requieren código nativo)
- ❌ **Permisos nuevos** (cámara, ubicación, etc.)
- ❌ **Cambios en app.json** que requieren rebuild:
  - Cambiar `package` (Android) o `bundleIdentifier` (iOS)
  - Agregar nuevos plugins nativos
  - Cambiar configuración de iconos/splash
- ❌ **Cambiar la versión de la app**

### 🔑 Concepto Clave: Runtime Version

Tu app está configurada con:
```json
"runtimeVersion": {
  "policy": "appVersion"
}
```

Esto significa:
- **Misma versión** (`1.0.0`) = Mismo runtimeVersion = Updates OTA funcionan
- **Nueva versión** (`1.0.1`) = Nuevo runtimeVersion = Necesitas nuevo build

### 📱 Cómo Publicar Actualizaciones

#### 1. Desarrollo
```bash
npm run update:development -- "Descripción de la actualización"
# o
eas update --branch development --message "Descripción"
```

#### 2. Preview/Staging
```bash
npm run update:preview -- "Descripción de la actualización"
# o
eas update --branch preview --message "Descripción"
```

#### 3. Producción
```bash
npm run update:production -- "Descripción de la actualización"
# o
eas update --branch production --message "Descripción"
```

### 🏗️ Builds de Desarrollo vs Producción

| Aspecto | Build de Desarrollo | Build de Producción |
|---------|---------------------|---------------------|
| **Canal de updates** | `development` | `production` |
| **¿Se sube a tiendas?** | ❌ NO (opcional) | ✅ SÍ |
| **¿Recibe updates OTA?** | ✅ SÍ | ✅ SÍ |
| **Distribución** | Interna (APK/IPA directo) | Play Store / App Store |
| **Uso típico** | Testing, beta testers | Usuarios finales |

#### Crear Build de Desarrollo

```bash
# Android
eas build --platform android --profile development

# iOS
eas build --platform ios --profile development

# Ambos
eas build --platform all --profile development
```

**Resultado:**
- ✅ Obtienes un APK (Android) o IPA (iOS)
- ✅ Lo instalas directamente en dispositivos (sin tiendas)
- ✅ El build está configurado para recibir updates del canal `development`
- ✅ Puedes seguir actualizándolo con OTA sin límite

#### Crear Build de Producción

```bash
# Android (APK con distribución interna)
eas build --platform android --profile production

# iOS
eas build --platform ios --profile production
```

**Resultado:**
- ✅ Obtienes un APK (Android) o IPA (iOS) con distribución interna
- ✅ Puedes instalarlo directamente en dispositivos (sin pasar por tiendas)
- ✅ Configurado para recibir updates del canal `production`
- ✅ Puedes seguir actualizándolo con OTA
- ✅ Si necesitas subirlo a tiendas más adelante, puedes crear un nuevo build con `distribution: "store"` o cambiar la configuración

### 📋 Requisitos Previos para Updates

1. **Instalar EAS CLI** (si no lo tienes):
   ```bash
   npm install -g eas-cli
   ```

2. **Autenticarse con Expo**:
   ```bash
   eas login
   ```

3. **Configurar el proyecto** (si es la primera vez):
   ```bash
   eas build:configure
   ```

### 🔄 Flujo de Trabajo Recomendado

#### Para Desarrollo
1. Crea un build de desarrollo una vez:
   ```bash
   eas build --platform android --profile development
   ```
2. Distribúyelo manualmente (APK/IPA) a tus testers
3. Haz cambios en el código
4. Publica actualizaciones:
   ```bash
   npm run update:development -- "Fix: Corregido bug en login"
   ```
5. Los dispositivos reciben la actualización automáticamente

#### Para Producción
1. Crea un build de producción:
   ```bash
   eas build --platform android --profile production
   ```
2. Publica en Play Store/App Store
3. Haz cambios en el código
4. Publica actualizaciones:
   ```bash
   npm run update:production -- "Nueva funcionalidad: Gestos de navegación"
   ```
5. Los usuarios reciben la actualización automáticamente al abrir la app

### 📊 Ejemplo Real de Uso

#### Semana 1: Lanzamiento Inicial
```bash
# 1. Compilas y publicas versión 1.0.0
eas build --platform android --profile production
# → Publicas en Play Store
```

#### Semana 2-10: Actualizaciones OTA (sin nuevo build)
```bash
# 2. Corriges un bug
npm run update:production -- "Fix: Error en login"

# 3. Agregas nueva funcionalidad
npm run update:production -- "Nueva: Filtros de búsqueda"

# 4. Mejoras UI
npm run update:production -- "Mejora: Nuevos colores"

# 5. Más correcciones
npm run update:production -- "Fix: Performance mejorado"
# ... y así sucesivamente, SIN LÍMITE
```

#### Semana 11: Necesitas agregar cámara (código nativo)
```bash
# 6. Agregas expo-camera (requiere código nativo)
# → Necesitas nuevo build
# → Cambias versión a 1.1.0 en app.json
eas build --platform android --profile production
# → Publicas nuevo build en Play Store
```

#### Semana 12+: Siguen las updates OTA
```bash
# 7. Ahora puedes seguir con updates para versión 1.1.0
npm run update:production -- "Mejora: Optimización de cámara"
# ... y así sucesivamente
```

### 🎯 Resumen de Cuándo Usar OTA vs Nuevo Build

| Situación | ¿Necesitas nuevo build? | ¿Puedes usar OTA? |
|-----------|-------------------------|-------------------|
| Cambias código JS/TS | ❌ NO | ✅ SÍ |
| Cambias estilos/UI | ❌ NO | ✅ SÍ |
| Agregas pantalla nueva | ❌ NO | ✅ SÍ |
| Corriges bugs | ❌ NO | ✅ SÍ |
| Cambias versión (1.0.0 → 1.0.1) | ✅ SÍ | Después sí |
| Agregas plugin nativo | ✅ SÍ | Después sí |
| Cambias package name | ✅ SÍ | Después sí |

### 🔍 Verificar Estado de Updates

Puedes ver el estado de tus actualizaciones en:
- Dashboard de Expo: https://expo.dev
- O usando el CLI:
  ```bash
  eas update:list
  eas update:list --branch development
  eas update:list --branch production
  ```

### 🛠️ Componente Opcional para Control Manual

Si quieres control manual de actualizaciones, puedes usar el componente `UpdateManager` en `components/UpdateManager.tsx`:

```tsx
import { UpdateManager } from "@/components/UpdateManager";

export default function RootLayout() {
  return (
    <>
      <UpdateManager />
      {/* resto de tu código */}
    </>
  );
}
```

O usar el hook `useUpdates` para verificar manualmente:

```tsx
import { useUpdates } from "@/components/UpdateManager";

function MyComponent() {
  const { isAvailable, checkForUpdates } = useUpdates();
  
  // ...
}
```

### ⚠️ Troubleshooting

#### La app no se actualiza
1. Verifica que el build esté usando el canal correcto
2. Asegúrate de que `runtimeVersion` coincida
3. Revisa los logs: `eas update:list`

#### Error al publicar
1. Verifica que estés autenticado: `eas whoami`
2. Verifica que el proyecto esté configurado: `eas project:info`
3. Revisa que tengas permisos en el proyecto

### 💡 Recomendación

1. **Compila una vez** con versión `1.0.0`
2. **Publica en las tiendas**
3. **Usa updates OTA** para todos los cambios de JavaScript
4. **Solo compila de nuevo** cuando:
   - Necesites código nativo nuevo
   - Quieras cambiar la versión
   - Necesites cambiar configuración nativa

**En la práctica**: Puedes pasar meses o años actualizando solo con OTA, compilando solo cuando realmente necesites cambios nativos.

### 📚 Más Información

- [Documentación de EAS Update](https://docs.expo.dev/eas-update/introduction/)
- [Guía de Runtime Versions](https://docs.expo.dev/eas-update/runtime-versions/)
- [Documentación oficial de Expo](https://docs.expo.dev/)

## Notas adicionales

- Asegúrate de que tu dispositivo o emulador esté conectado a la misma red que tu computadora.
- Si encuentras problemas, intenta limpiar la caché de Expo con el siguiente comando:

  ```bash
  npx expo start --clear
  ```

- Consulta la [documentación oficial de Expo](https://docs.expo.dev/) para más información sobre cómo usar Expo.

---

¡Disfruta desarrollando con Stock Pisos!
