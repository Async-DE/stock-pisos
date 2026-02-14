# ¿Cómo Funcionan las Actualizaciones OTA?

## 🎯 Respuesta Corta

**SÍ, puedes seguir actualizando tu app después de compilarla**, pero hay reglas importantes.

## 📊 Flujo de Actualizaciones

### Escenario 1: Misma Versión de App (1.0.0)

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

5. Haces más cambios, publicas otra update
   ✅ Sigue funcionando...
```

**Conclusión**: Mientras la versión sea `1.0.0`, puedes publicar **ilimitadas actualizaciones OTA**.

---

### Escenario 2: Cambias la Versión (1.0.0 → 1.0.1)

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

**Conclusión**: Cuando cambias la versión, necesitas un nuevo build, pero después puedes seguir actualizando.

---

## ✅ Lo que SÍ puedes actualizar (sin nuevo build)

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

---

## ❌ Lo que NO puedes actualizar (requiere nuevo build)

- ❌ **Código nativo** (Java, Kotlin, Swift, Objective-C)
- ❌ **Dependencias nativas** (librerías que requieren código nativo)
- ❌ **Permisos nuevos** (cámara, ubicación, etc.)
- ❌ **Cambios en app.json** que requieren rebuild:
  - Cambiar `package` (Android) o `bundleIdentifier` (iOS)
  - Agregar nuevos plugins nativos
  - Cambiar configuración de iconos/splash
- ❌ **Cambiar la versión de la app**

**Ejemplos que requieren nuevo build:**
- Agregar un nuevo plugin nativo (ej: expo-camera si no estaba)
- Cambiar el package name de Android
- Actualizar dependencias nativas
- Cambiar permisos en app.json

---

## 🔑 Concepto Clave: Runtime Version

Tu app está configurada con:
```json
"runtimeVersion": {
  "policy": "appVersion"
}
```

Esto significa:
- **Misma versión** (`1.0.0`) = Mismo runtimeVersion = Updates OTA funcionan
- **Nueva versión** (`1.0.1`) = Nuevo runtimeVersion = Necesitas nuevo build

---

## 📱 Ejemplo Real de Uso

### Semana 1: Lanzamiento Inicial
```bash
# 1. Compilas y publicas versión 1.0.0
eas build --platform android --profile production
# → Publicas en Play Store
```

### Semana 2-10: Actualizaciones OTA (sin nuevo build)
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

### Semana 11: Necesitas agregar cámara (código nativo)
```bash
# 6. Agregas expo-camera (requiere código nativo)
# → Necesitas nuevo build
# → Cambias versión a 1.1.0 en app.json
eas build --platform android --profile production
# → Publicas nuevo build en Play Store
```

### Semana 12+: Siguen las updates OTA
```bash
# 7. Ahora puedes seguir con updates para versión 1.1.0
npm run update:production -- "Mejora: Optimización de cámara"
# ... y así sucesivamente
```

---

## 🎯 Resumen

| Situación | ¿Necesitas nuevo build? | ¿Puedes usar OTA? |
|-----------|-------------------------|-------------------|
| Cambias código JS/TS | ❌ NO | ✅ SÍ |
| Cambias estilos/UI | ❌ NO | ✅ SÍ |
| Agregas pantalla nueva | ❌ NO | ✅ SÍ |
| Corriges bugs | ❌ NO | ✅ SÍ |
| Cambias versión (1.0.0 → 1.0.1) | ✅ SÍ | Después sí |
| Agregas plugin nativo | ✅ SÍ | Después sí |
| Cambias package name | ✅ SÍ | Después sí |

---

## 💡 Recomendación

1. **Compila una vez** con versión `1.0.0`
2. **Publica en las tiendas**
3. **Usa updates OTA** para todos los cambios de JavaScript
4. **Solo compila de nuevo** cuando:
   - Necesites código nativo nuevo
   - Quieras cambiar la versión
   - Necesites cambiar configuración nativa

**En la práctica**: Puedes pasar meses o años actualizando solo con OTA, compilando solo cuando realmente necesites cambios nativos.

