# Informe de Uso de Inteligencia Artificial (Backend)

En el desarrollo de la API **TrackRoute**, se integraron herramientas de Inteligencia Artificial como asistentes de productividad, permitiendo completar el ciclo de desarrollo en menos de 24 horas manteniendo estándares de calidad empresarial.

## 🤖 Áreas de Aplicación de la IA

### 1. Boilerplate y Estructura Base
La IA facilitó la generación rápida de la configuración inicial de **TypeScript**, **Express** y la estructura de carpetas. Esto permitió ahorrar aproximadamente 2 horas de configuración manual de entornos y transpiladores.

### 2. Validación y Esquemas (Zod)
Se utilizó la IA para traducir los requerimientos del negocio a esquemas de validación de **Zod**. Esto garantizó que las reglas de negocio (ej. formatos de fecha, tipos de vehículos y estados permitidos) estuvieran correctamente tipadas y validadas desde el primer minuto.

### 3. Mocking del Servicio Externo (SOAP)
Dado que la integración requería interactuar con un servicio SOAP legado, la IA asistió en la creación de los mocks de respuesta XML. Esto permitió simular escenarios de éxito y error (ej. ruta no encontrada, error de conexión) sin depender de un servidor externo real durante la fase de desarrollo.

### 4. Optimización de Consultas SQL
La IA ayudó a estructurar las sentencias SQL para SQLite, optimizando los JOINS y las cláusulas de paginación para garantizar un rendimiento fluido incluso con el dataset de prueba.

---

## 🧠 Decisiones Humanas (Arquitectura y Diseño)

Es importante recalcar que, aunque la IA aceleró la escritura de código, **las decisiones estratégicas fueron tomadas por el arquitecto a cargo**:

- **Elección de Patrones:** El diseño del **Patrón Adapter** para aislar el servicio de Tracking fue una decisión humana para garantizar la mantenibilidad del código a largo plazo.
- **Definición de Endpoints:** La estructura de la API REST y la jerarquía de recursos fue diseñada para ser intuitiva y seguir las mejores prácticas de la industria.
- **Estrategia de Datos:** La decisión pragmática de utilizar **SQLite** para maximizar la portabilidad y cumplir con el plazo de 24 horas fue una decisión de ingeniería basada en el contexto de la prueba técnica.

---

> **Conclusión:** La IA funcionó como un multiplicador de fuerza, permitiendo que el desarrollador se enfocara en la arquitectura y el diseño, mientras la herramienta se encargaba de las tareas repetitivas y la generación de código boilerplate.
