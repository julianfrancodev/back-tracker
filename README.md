# LogisColombia - Backend API

Esta es una API RESTful construida con una arquitectura profesional por capas (Controller -> Service -> Repository) diseñada para gestionar rutas de transporte logístico y simular el monitoreo de vehículos en tiempo real. Fue desarrollada utilizando **Node.js, Express, TypeScript, SQLite** y testeada con **Jest y Supertest**.

## Requisitos Previos

Para ejecutar este proyecto en tu entorno local, asegúrate de tener instalados:
- **Node.js** (versión 18 o superior)
- **npm** (Node Package Manager)

## Configuración y Ejecución (Paso a Paso)

Sigue estos pasos para levantar el proyecto localmente sin complicaciones:

### Paso 1: Instalación de dependencias
Clona este repositorio, abre tu terminal en la carpeta del backend y ejecuta:
```bash
npm install
```

### Paso 2: Variables de entorno
Crea un archivo llamado `.env` en la raíz del proyecto basándote en el archivo de ejemplo proporcionado. Asegúrate de configurar las siguientes variables críticas:
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=tu_super_secreto_aqui
```

### Paso 3: Inicialización de Base de Datos y Seed
El proyecto utiliza un script automático para crear la estructura de datos en SQLite e hidratarla con datos masivos. Asegúrate de que el archivo `routes_dataset.csv` esté en la raíz y ejecuta:
```bash
npm run seed
```
> [!NOTE] 
> Este comando no solo carga las rutas desde el CSV, sino que inyecta los usuarios iniciales de prueba en la base de datos con contraseñas hasheadas (bcrypt):
> - Administrador: Usuario `admin` | Password `admin123`
> - Operador: Usuario `operador` | Password `operador123`

### Paso 4: Levantar el servidor
Finalmente, inicia el servidor en modo desarrollo (con auto-recarga):
```bash
npm run dev
```

## Scripts Disponibles

En el archivo `package.json` están configurados los siguientes comandos para agilizar el desarrollo:

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor en modo desarrollo usando `ts-node-dev`. |
| `npm run build` | Transpila el código fuente TypeScript a JavaScript (carpeta `dist`). |
| `npm run start` | Ejecuta el servidor compilado en producción (`node dist/index.js`). |
| `npm run seed` | Inicializa SQLite y carga la base de datos con el dataset CSV y usuarios base. |
| `npm run test` | Ejecuta la suite completa de pruebas unitarias y de integración con Jest y retorna la tabla de cobertura. |

## Notas de Arquitectura

Para facilitar la escalabilidad y la revisión técnica, se tomaron las siguientes decisiones de diseño:

- **SQLite:** Se optó por utilizar `node:sqlite` (nativo) para garantizar la portabilidad total del proyecto. De esta forma, cualquier desarrollador puede clonar, instalar y probar el sistema instantáneamente sin el dolor de cabeza de configurar contenedores de Docker o credenciales externas de bases de datos.
- **Integración SOAP (Tiempo Real):** El endpoint de rastreo o tracking utiliza un **Patrón Adapter** con un *Mock* interno. Este adaptador implementa una agresiva estrategia de **Caché en Memoria** usando `node-cache` con un TTL (Time-To-Live) estricto de 60 segundos. Esto simula cómo se protegería el sistema legado SOAP real ante las consultas masivas del frontend, las cuales hacen *polling* cada 30 segundos.

## Pruebas de API

Todos los endpoints de esta API están debidamente documentados en una colección de Postman.
En la raíz del proyecto principal encontrarás el archivo **`Postman_Collection.json`**. Impórtalo en tu cliente HTTP preferido para probar todos los flujos.

> [!IMPORTANT]
> Recuerda que la API está protegida. Debes iniciar sesión mediante el endpoint `/api/auth/login` y copiar el token devuelto. Luego, configúralo en la pestaña `Authorization` seleccionando **Bearer Token** en todas tus peticiones subsecuentes.
