# TrackRoute API - LogisColombia Technical Challenge

## 📌 Descripción
TrackRoute es una API REST robusta desarrollada para **LogisColombia** que permite la gestión eficiente de rutas logísticas y el seguimiento en tiempo real del progreso de las mismas. El sistema integra un dataset inicial mediante importación masiva y se comunica con un servicio legado de tracking (SOAP) a través de una capa de abstracción moderna.

---

## 🚀 Guía de Inicio Rápido

### Requisitos Previos
- Node.js (v18 o superior)
- npm o yarn

### Instalación
1. Clonar el repositorio:
   ```bash
   git clone <url-del-repositorio>
   cd back-tracker
   ```
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Configurar variables de entorno:
   Crea un archivo `.env` en la raíz (basado en `.env.example`):
   ```env
   PORT=3000
   JWT_SECRET=tu_secreto_super_seguro
   DATABASE_URL=database.sqlite
   ```

### Preparación de la Base de Datos
Para cargar el dataset inicial desde el archivo CSV proporcionado:
```bash
npm run seed
```

### Ejecución
- **Desarrollo (con Hot-Reload):**
  ```bash
  npm run dev
  ```
- **Producción:**
  ```bash
  npm run build
  npm start
  ```

---

## 🏛️ Decisiones de Arquitectura

### 1. El Dilema de la Base de Datos: ¿Por qué SQLite?
Para esta prueba técnica (límite de 24h), se optó por **SQLite** en lugar de PostgreSQL/MongoDB por tres razones estratégicas:
- **Cero Fricción para el Evaluador:** El evaluador no necesita configurar contenedores de Docker ni bases de datos locales; la API es "Plug & Play".
- **Portabilidad Extrema:** La base de datos es un archivo dentro del proyecto, garantizando que el estado sea consistente entre entornos.
- **Velocidad de Desarrollo:** Permitió centrar el esfuerzo en la lógica de negocio y el patrón Adapter, entregando un CRUD completo y testeado en tiempo récord.

### 2. Estructura por Capas
Se implementó una arquitectura limpia dividida en:
- **Controllers:** Manejo de la interfaz HTTP y parsing de entrada.
- **Services:** Orquestación de la lógica de negocio y comunicación entre capas.
- **Repositories:** Abstracción del acceso a datos (Data Access Object).
- **DTOs (Zod):** Validación estricta de esquemas de datos en tiempo de ejecución.

### 3. Patrón Adapter (Tracking Integration)
Para cumplir con el requerimiento de integración con el servicio SOAP legado, se implementó el **Patrón Adapter**. 
- El `TrackingAdapter` encapsula la complejidad de la comunicación SOAP (o su mock en este caso).
- El resto de la aplicación interactúa con una interfaz limpia en TypeScript, aislando por completo la lógica del negocio de los detalles de implementación del servicio externo.

---

## 🧪 Pruebas
Para ejecutar la suite de pruebas unitarias y de integración:
```bash
npm test
```
