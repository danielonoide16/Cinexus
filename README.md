# 🎬 Cinexus

Cinexus es una plataforma web full-stack para descubrir películas, crear reseñas, organizar listas personales y conectar con otros usuarios mediante un sistema de amigos.

---

## 📌 Tabla de contenidos

- [🎬 Cinexus](#-cinexus)
  - [📌 Tabla de contenidos](#-tabla-de-contenidos)
  - [🚀 Resumen del proyecto](#-resumen-del-proyecto)
  - [🧩 Funcionalidades principales](#-funcionalidades-principales)
  - [🏗️ Arquitectura](#️-arquitectura)
  - [🛠️ Stack tecnológico](#️-stack-tecnológico)
  - [📁 Estructura del proyecto](#-estructura-del-proyecto)
  - [🔌 Endpoints principales](#-endpoints-principales)
  - [⚙️ Instalación y ejecución local](#️-instalación-y-ejecución-local)
  - [🔐 Variables de entorno](#-variables-de-entorno)
  - [✅ Estado actual](#-estado-actual)
  - [📈 Mejoras futuras sugeridas](#-mejoras-futuras-sugeridas)
  - [👤 Autor](#-autor)

---

## 🚀 Resumen del proyecto

Cinexus combina en una sola aplicación:

- Catálogo de películas con búsqueda, filtros y paginación
- Reseñas por usuario
- Listas personalizadas de películas
- Perfiles públicos/privados
- Sistema social de amistad (solicitudes, aceptar/rechazar, eliminar)

Es un proyecto orientado a demostrar habilidades de desarrollo **full-stack**, integración de APIs de terceros y diseño de producto web funcional.

---

## 🧩 Funcionalidades principales

### 1) Autenticación y cuentas
- Registro e inicio de sesión con JWT
- Contraseñas hasheadas con bcrypt
- Edición de perfil (nombre, bio, contraseña)
- Subida de avatar
- Eliminación de cuenta y limpieza de relaciones

### 2) Películas
- Descubrimiento de películas recientes
- Búsqueda por texto
- Filtro por género y año
- Vista de detalle de película
- Trailer embebido (YouTube, cuando disponible)

### 3) Reseñas
- Crear o actualizar reseña (1 por usuario/película)
- Eliminar reseña propia
- Ver reseñas por película
- Ver historial personal de reseñas

### 4) Listas personalizadas
- Crear listas de películas
- Editar nombre, descripción y contenido
- Eliminar listas
- Añadir película a lista desde detalle

### 5) Social
- Buscar usuarios
- Enviar solicitudes de amistad
- Aceptar / rechazar solicitudes
- Ver amigos
- Eliminar amigos
- Ver perfil público (reviews, listas y amigos)

---

## 🏗️ Arquitectura

```text
FRONTEND (HTML/CSS/JS)
   ↓ HTTP (XMLHttpRequest + JWT)
BACKEND (Express API)
   ↓
MongoDB (Mongoose)
   ↘
   APIs externas (TMDB / OMDB / YouTube)
