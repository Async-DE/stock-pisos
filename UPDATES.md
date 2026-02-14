# Guía de Actualizaciones OTA (Over-The-Air)

Este proyecto está configurado para usar **EAS Update** de Expo, que permite publicar actualizaciones de JavaScript y assets sin necesidad de pasar por las tiendas de aplicaciones.

## Configuración Completada

✅ `expo-updates` instalado
✅ Configuración en `app.json` para updates
✅ Perfiles de update en `eas.json`
✅ Scripts de npm para publicar updates

## Cómo Publicar Actualizaciones

### 1. Desarrollo
```bash
npm run update:development -- "Descripción de la actualización"
# o
eas update --branch development --message "Descripción"
```

### 2. Preview/Staging
```bash
npm run update:preview -- "Descripción de la actualización"
# o
eas update --branch preview --message "Descripción"
```

### 3. Producción
```bash
npm run update:production -- "Descripción de la actualización"
# o
eas update --branch production --message "Descripción"
```

## Requisitos Previos

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

## Flujo de Trabajo Recomendado

### Para Desarrollo
1. Haz tus cambios en el código
2. Publica la actualización:
   ```bash
   npm run update:development -- "Fix: Corregido bug en login"
   ```
3. La app en desarrollo se actualizará automáticamente

### Para Producción
1. Asegúrate de que tu build de producción esté usando el canal correcto
2. Haz tus cambios
3. Publica la actualización:
   ```bash
   npm run update:production -- "Nueva funcionalidad: Gestos de navegación"
   ```
4. Los usuarios recibirán la actualización automáticamente al abrir la app

## Configuración de Runtime Version

El proyecto está configurado con `runtimeVersion: { policy: "appVersion" }`, lo que significa que:
- Las actualizaciones solo se aplicarán a builds con la misma versión de app
- Cuando cambies la versión en `app.json`, necesitarás crear un nuevo build

### Cambiar la Versión
1. Actualiza `version` en `app.json` (ej: `"1.0.1"`)
2. Crea un nuevo build:
   ```bash
   eas build --platform android --profile production
   ```
3. Las actualizaciones futuras se aplicarán a este nuevo build

## Canales de Actualización

- **development**: Para builds de desarrollo
- **preview**: Para builds de prueba/preview
- **production**: Para builds de producción

## Verificar Estado de Updates

Puedes ver el estado de tus actualizaciones en:
- Dashboard de Expo: https://expo.dev
- O usando el CLI:
  ```bash
  eas update:list
  ```

## Limitaciones

⚠️ **Importante**: Las actualizaciones OTA solo pueden actualizar:
- ✅ Código JavaScript/TypeScript
- ✅ Assets (imágenes, fuentes, etc.)
- ✅ Configuración de Expo

❌ **NO pueden actualizar**:
- Código nativo (Java, Kotlin, Swift, Objective-C)
- Dependencias nativas
- Permisos nativos
- Cambios en `app.json` que requieren rebuild

Para estos cambios, necesitarás crear un nuevo build y publicarlo en las tiendas.

## Componente Opcional

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

## Troubleshooting

### La app no se actualiza
1. Verifica que el build esté usando el canal correcto
2. Asegúrate de que `runtimeVersion` coincida
3. Revisa los logs: `eas update:list`

### Error al publicar
1. Verifica que estés autenticado: `eas whoami`
2. Verifica que el proyecto esté configurado: `eas project:info`
3. Revisa que tengas permisos en el proyecto

## Más Información

- [Documentación de EAS Update](https://docs.expo.dev/eas-update/introduction/)
- [Guía de Runtime Versions](https://docs.expo.dev/eas-update/runtime-versions/)

