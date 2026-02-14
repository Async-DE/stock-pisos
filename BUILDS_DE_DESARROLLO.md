# Builds de Desarrollo y Actualizaciones OTA

## ✅ Respuesta Corta

**SÍ, puedes crear un build de desarrollo y seguir actualizándolo con OTA sin subirlo a las tiendas.**

## 🎯 Cómo Funciona

### Build de Desarrollo vs Producción

| Aspecto | Build de Desarrollo | Build de Producción |
|---------|---------------------|---------------------|
| **Canal de updates** | `development` | `production` |
| **¿Se sube a tiendas?** | ❌ NO (opcional) | ✅ SÍ |
| **¿Recibe updates OTA?** | ✅ SÍ | ✅ SÍ |
| **Distribución** | Interna (APK/IPA directo) | Play Store / App Store |
| **Uso típico** | Testing, beta testers | Usuarios finales |

## 📱 Flujo de Trabajo con Build de Desarrollo

### Paso 1: Crear el Build de Desarrollo

```bash
# Android
eas build --platform android --profile development

# iOS
eas build --platform ios --profile development
```

**Resultado:**
- ✅ Obtienes un APK (Android) o IPA (iOS)
- ✅ Lo instalas directamente en dispositivos (sin tiendas)
- ✅ El build está configurado para recibir updates del canal `development`

### Paso 2: Distribuir el Build

**Opciones:**
1. **Instalación directa**: Descargas el APK/IPA y lo instalas manualmente
2. **TestFlight (iOS)**: Puedes subirlo a TestFlight para distribución interna
3. **Internal Testing (Android)**: Puedes usar Google Play Internal Testing (opcional)
4. **Enlace directo**: Compartes el enlace de descarga del build

### Paso 3: Publicar Actualizaciones OTA

```bash
# Publicar update para el canal development
npm run update:development -- "Fix: Corregido bug en login"

# O directamente
eas update --branch development --message "Nueva funcionalidad"
```

**Resultado:**
- ✅ Los dispositivos con el build de desarrollo reciben la actualización automáticamente
- ✅ No necesitas crear un nuevo build
- ✅ No necesitas reinstalar la app
- ✅ Funciona igual que en producción

### Paso 4: Seguir Actualizando

```bash
# Puedes seguir publicando updates ilimitadas
npm run update:development -- "Mejora: Performance"
npm run update:development -- "Nueva: Pantalla de reportes"
npm run update:development -- "Fix: Error en búsqueda"
# ... sin límite
```

## 🔄 Comparación: Desarrollo vs Producción

### Build de Desarrollo
```bash
# 1. Crear build
eas build --platform android --profile development
# → Obtienes APK, lo instalas manualmente

# 2. Publicar updates (ilimitadas)
npm run update:development -- "Cambio 1"
npm run update:development -- "Cambio 2"
npm run update:development -- "Cambio 3"
# → Los usuarios con el build reciben las updates automáticamente
```

### Build de Producción
```bash
# 1. Crear build
eas build --platform android --profile production
# → Subes a Play Store/App Store

# 2. Publicar updates (ilimitadas)
npm run update:production -- "Cambio 1"
npm run update:production -- "Cambio 2"
npm run update:production -- "Cambio 3"
# → Los usuarios con el build reciben las updates automáticamente
```

**Diferencia principal**: Solo cambia el **canal** de updates, pero ambos funcionan igual.

## 🎯 Casos de Uso

### Caso 1: Testing Interno
```bash
# Creas build de desarrollo
eas build --platform android --profile development

# Lo instalas en 5 dispositivos de prueba
# → Cada dispositivo tiene el mismo build

# Haces cambios y publicas updates
npm run update:development -- "Fix: Bug corregido"
# → Los 5 dispositivos reciben la actualización automáticamente
```

### Caso 2: Beta Testers
```bash
# Creas build de desarrollo
eas build --platform android --profile development

# Distribuyes el APK a 50 beta testers
# → Todos tienen el mismo build

# Haces mejoras y publicas updates
npm run update:development -- "Nueva funcionalidad"
# → Los 50 beta testers reciben la actualización automáticamente
```

### Caso 3: Desarrollo Activo
```bash
# Creas build de desarrollo una vez
eas build --platform android --profile development

# Durante semanas/meses, solo publicas updates
npm run update:development -- "Día 1: Cambios"
npm run update:development -- "Día 2: Más cambios"
npm run update:development -- "Día 3: Correcciones"
# → No necesitas crear nuevos builds
```

## ⚙️ Configuración Actual

Tu proyecto ya está configurado con:

### `eas.json`
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      // ... configuración
    }
  },
  "update": {
    "development": {
      "developmentClient": true,
      "channel": "development"
    }
  }
}
```

### Scripts en `package.json`
```json
{
  "scripts": {
    "update:development": "eas update --branch development --message"
  }
}
```

## 📋 Comandos Útiles

### Crear Build de Desarrollo
```bash
# Android
eas build --platform android --profile development

# iOS
eas build --platform ios --profile development

# Ambos
eas build --platform all --profile development
```

### Publicar Update de Desarrollo
```bash
npm run update:development -- "Descripción del cambio"
```

### Ver Updates Publicadas
```bash
eas update:list --branch development
```

### Ver Info del Build
```bash
eas build:list --profile development
```

## ⚠️ Importante

1. **Mismo runtimeVersion**: El build y las updates deben tener el mismo `runtimeVersion` (misma versión en `app.json`)

2. **Canal correcto**: Asegúrate de publicar updates al canal `development` para builds de desarrollo

3. **No mezclar canales**: 
   - Build de desarrollo → Updates en canal `development`
   - Build de producción → Updates en canal `production`

4. **Límites iguales**: Las mismas limitaciones aplican:
   - ✅ Puedes actualizar código JavaScript/TypeScript
   - ❌ No puedes actualizar código nativo (requiere nuevo build)

## 🎉 Ventajas

- ✅ **Rápido**: No necesitas crear nuevos builds para cada cambio
- ✅ **Económico**: No pagas por builds adicionales (solo el primero)
- ✅ **Flexible**: Puedes distribuir a quien quieras sin pasar por tiendas
- ✅ **Ideal para testing**: Perfecto para beta testers y testing interno

## 📝 Ejemplo Completo

```bash
# Día 1: Crear build de desarrollo
eas build --platform android --profile development
# → Descargas APK, lo instalas en dispositivos de prueba

# Día 2: Haces cambios en el código
# → Modificas una pantalla, agregas funcionalidad

# Día 2: Publicar update
npm run update:development -- "Nueva funcionalidad agregada"
# → Los dispositivos reciben la actualización automáticamente

# Día 3: Más cambios
# → Corriges bugs, mejoras UI

# Día 3: Publicar otra update
npm run update:development -- "Fix: Bugs corregidos"
# → Los dispositivos reciben la nueva actualización

# Día 4, 5, 6...: Sigue igual
# → Puedes seguir publicando updates sin límite
# → Sin necesidad de crear nuevos builds
```

## 🚀 Resumen

**SÍ, puedes crear un build de desarrollo y seguir actualizándolo con OTA sin subirlo a las tiendas.**

- ✅ Crea el build una vez
- ✅ Distribúyelo manualmente (APK/IPA)
- ✅ Publica updates ilimitadas con `npm run update:development`
- ✅ Los usuarios reciben las actualizaciones automáticamente
- ✅ Funciona exactamente igual que en producción, solo cambia el canal

