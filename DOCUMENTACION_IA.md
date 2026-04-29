# Documentación sobre el Uso de Inteligencia Artificial

## 1. Filosofía de Trabajo (Backend)

En el contexto de esta prueba técnica con un tiempo límite estricto de 24 horas, he adoptado una filosofía de desarrollo pragmática y eficiente. He utilizado herramientas de Inteligencia Artificial exclusivamente como asistentes de "tipeo rápido" y generación de código repetitivo (boilerplate). 

Mi objetivo principal al integrar la IA en mi flujo de trabajo fue acelerar las tareas mecánicas para poder enfocar el 100% de mi capacidad cognitiva, tiempo y energía en el diseño de la arquitectura del backend, la toma de decisiones críticas de negocio y la resolución de problemas lógicos complejos. El control total sobre la arquitectura, la seguridad, la estructura de la base de datos y los patrones de diseño se mantuvo siempre bajo mi criterio técnico como desarrollador.

## 2. Dónde y Cómo se utilizó la IA

La asistencia de la IA se limitó estratégicamente a las siguientes áreas para optimizar la velocidad de entrega sin comprometer la calidad arquitectónica:

* **Generación de Boilerplate:** Aceleración en la escritura de configuraciones iniciales del servidor Express, setup de TypeScript, y la estructura base de linters y frameworks de testing (ESLint, Jest).
* **Scripting de Datos (Seeding):** Creación rápida del script para la lectura del archivo CSV y poblamiento inicial de la base de datos SQLite.
* **Validaciones y Tipado:** Asistencia en la sintaxis para construir rápidamente los esquemas de validación estricta con Zod y la generación de las interfaces de tipado para TypeScript.
* **Estructura de Testing:** Generación del esqueleto base para las pruebas de integración utilizando Supertest, permitiéndome enfocarme en la lógica de las aserciones.

## 3. Decisiones Arquitectónicas (El Factor Humano)

Es fundamental destacar que todas las decisiones estructurales y de diseño fueron tomadas exclusivamente por mí, priorizando la mantenibilidad, escalabilidad y los requerimientos del negocio:

* **Elección de SQLite:** Opté por SQLite como motor de base de datos para garantizar la máxima portabilidad del proyecto. Esto facilita enormemente el proceso de revisión por parte del equipo técnico, permitiendo ejecutar y evaluar el backend inmediatamente sin la fricción de requerir configuraciones de red o levantar contenedores de Docker complejos.
* **Patrón Adapter y Caché:** Para cumplir con el requerimiento en tiempo real de la integración SOAP, diseñé conscientemente un patrón Adaptador con un mock interno. A este adaptador le integré una estrategia de caché en memoria (usando `node-cache` con un TTL exacto de 60 segundos). Esta decisión de diseño protege activamente al supuesto "servicio legado" de una sobrecarga, optimizando las respuestas del servidor ante el polling intensivo de 30 segundos exigido por el cliente frontend.
* **Arquitectura por Capas:** Decidí estructurar el backend siguiendo el patrón de diseño *Controller -> Service -> Repository*. Esta separación clara de responsabilidades fomenta un alto desacoplamiento, facilita un entorno altamente testeable (logrando una excelente cobertura en la capa de servicios) y sienta las bases para una escalabilidad horizontal sin dolor.
* **Pragmatismo en Autenticación:** Tomé la decisión de inyectar los usuarios semilla (roles `ADMIN` y `OPERADOR`) directamente en la base de datos durante el proceso de inicialización. Evité construir un flujo de registro tradicional no solicitado por los requerimientos, optimizando así el valioso tiempo de desarrollo para enfocarme exclusivamente en perfeccionar las funcionalidades *core* de la prueba.
