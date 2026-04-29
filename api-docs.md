# Documentación de la API TrackRoute

Base URL: `http://localhost:3000/api`

## 🔐 Autenticación

### Login
Permite obtener un token JWT para acceder a los endpoints protegidos.

- **URL:** `/auth/login`
- **Método:** `POST`
- **Body:**
  ```json
  {
    "username": "admin",
    "password": "password123"
  }
  ```
- **Respuesta (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": 1,
        "username": "admin",
        "role": "ADMIN"
      }
    }
  }
  ```

---

## 🛣️ Gestión de Rutas

### Listar Rutas (Paginado)
Obtiene el listado de rutas con soporte para filtros y paginación. Requiere token en el header `Authorization`.

- **URL:** `/routes`
- **Método:** `GET`
- **Query Params:**
  - `page` (default: 1)
  - `limit` (default: 20)
  - `origin_city` (opcional)
  - `status` (opcional: ACTIVA, INACTIVA)
- **Respuesta (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "origin_city": "Bogotá",
        "destination_city": "Medellín",
        "status": "ACTIVA",
        "cost_usd": 320.50
      }
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 20
    }
  }
  ```

### Importar Rutas (CSV)
Carga masiva de rutas mediante un archivo CSV. Solo accesible para `ADMIN`.

- **URL:** `/routes/import`
- **Método:** `POST`
- **Body:** `multipart/form-data` (campo `file` con el archivo .csv)
- **Respuesta (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "imported": 100,
      "failed": 0,
      "errors": []
    }
  }
  ```

---

## 📡 Seguimiento (SOAP Integration)

### Consultar Tracking y ETA
Consulta el progreso de una ruta integrándose con el sistema legado SOAP mediante el `TrackingAdapter`.

- **URL:** `/routes/:id/tracking`
- **Método:** `GET`
- **Respuesta (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "routeId": 1,
      "status": "EN_TRANSITO",
      "progress": 65.5,
      "eta": "2024-05-01T14:30:00Z",
      "source": "SOAP Legacy System"
    }
  }
  ```

---

## 📊 Métricas del Dashboard
Endpoint adicional para visualizar el resumen de la operación.

- **URL:** `/routes/dashboard/metrics`
- **Método:** `GET`
- **Respuesta (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "status_counts": [
        { "status": "ACTIVA", "count": 85 },
        { "status": "INACTIVA", "count": 15 }
      ],
      "top_expensive": [...]
    }
  }
  ```
