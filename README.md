# E-commerce API REST

API completa de e-commerce desarrollada con Node.js, Express y MongoDB. Incluye sistema de autenticación JWT, gestión de productos, carritos de compra y un frontend funcional con notificaciones en tiempo real.

## Características principales

- Sistema de autenticación con JWT y cookies HTTP-only
- Gestión completa de productos con paginación y filtros
- Carritos de compra con proceso de checkout
- Panel de administración para productos en tiempo real (Socket.io)
- Sistema de notificaciones tipo toast
- Recuperación de contraseña por email
- Middleware de autorización por roles (user/admin)
- Frontend responsive con Handlebars

## Tecnologías utilizadas

**Backend:**

- Node.js + Express 5
- MongoDB + Mongoose 8
- Passport.js + JWT para autenticación
- bcrypt para encriptación de contraseñas
- Socket.io para comunicación en tiempo real
- Nodemailer para envío de emails

**Frontend:**

- Handlebars como motor de plantillas
- CSS vanilla con diseño responsive
- JavaScript moderno (ES6+)
- Sistema de notificaciones personalizado

## Estructura del proyecto

```
ecommerce-api-rest/
├── config/
│   ├── config.js                   # Configuración general
│   └── passport.config.js          # Estrategias de autenticación
│
├── src/
│   ├── controllers/                # Lógica de negocio
│   │   ├── sessions.controller.js
│   │   ├── products.controller.js
│   │   ├── carts.controller.js
│   │   └── views.controller.js
│   │
│   ├── dao/                        # Acceso a datos
│   │   ├── products.dao.db.js
│   │   ├── carts.dao.db.js
│   │   └── ...
│   │
│   ├── models/                     # Modelos de Mongoose
│   │   ├── user.model.js
│   │   ├── product.model.js
│   │   ├── cart.model.js
│   │   └── ticket.model.js
│   │
│   ├── routes/                     # Definición de rutas
│   │   ├── sessions.routes.js
│   │   ├── products.routes.js
│   │   ├── carts.routes.js
│   │   └── views.routes.js
│   │
│   ├── middlewares/                # Middleware personalizado
│   │   ├── auth.middleware.js      # Autenticación y autorización
│   │   ├── error.middleware.js     # Manejo de errores
│   │   └── views-auth.middleware.js
│   │
│   ├── utils/                      # Utilidades
│   │   ├── jwt.utils.js
│   │   ├── response.util.js
│   │   └── errors.util.js
│   │
│   └── views/                      # Plantillas Handlebars
│       ├── layouts/
│       ├── pages/
│       └── partials/
│
├── public/                         # Archivos estáticos
│   ├── css/
│   └── js/
│
├── .env.test                       # Variables de entorno (ejemplo)
└── server.js                       # Punto de entrada
```

## Instalación

### Requisitos previos

- Node.js 18 o superior
- MongoDB Atlas (cuenta gratuita) **O** usar la base de datos incluida
- Git

### Inicio Rápido (Para Profesores/Evaluadores)

El proyecto ya incluye credenciales de MongoDB configuradas para pruebas:

```bash
git clone https://github.com/ngcarcagno/Coderhouse_backend_II.git
cd ecommerce-api-rest
npm install
npm start
```

✅ **El servidor se conectará automáticamente a la base de datos de prueba.**

### Instalación Completa (Desarrollo)

1. **Clonar el repositorio**

```bash
git clone https://github.com/ngcarcagno/Coderhouse_backend_II.git
cd ecommerce-api-rest
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno (opcional)**

El archivo `.env.test` ya está configurado y funcional. Si deseas usar tu propia base de datos, edita `.env.test`:

```env
# MongoDB
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=tu_base_datos
DB_CLUSTER=tu_cluster.mongodb.net
```

4. **Iniciar el servidor**

```bash
# Modo producción (usa .env.test)
npm start

# Modo desarrollo con auto-reload
npm run dev
```

El servidor estará disponible en `http://localhost:8080`

### Verificar la Conexión

Si todo funciona correctamente, verás en la consola:

```
Conexión a MongoDB exitosa
Servidor escuchando en puerto 8080
```

## Endpoints principales

### Autenticación (`/api/sessions`)

| Método | Ruta                     | Descripción             | Requiere auth |
| ------ | ------------------------ | ----------------------- | ------------- |
| POST   | `/register`              | Registrar nuevo usuario | No            |
| POST   | `/login`                 | Iniciar sesión          | No            |
| GET    | `/current`               | Obtener usuario actual  | Sí            |
| POST   | `/logout`                | Cerrar sesión           | No            |
| POST   | `/forgot-password`       | Solicitar recuperación  | No            |
| POST   | `/reset-password/:token` | Restablecer contraseña  | No            |

### Productos (`/api/products`)

| Método | Ruta    | Descripción                 | Requiere auth |
| ------ | ------- | --------------------------- | ------------- |
| GET    | `/`     | Listar productos (paginado) | No            |
| GET    | `/:pid` | Obtener producto específico | No            |
| POST   | `/`     | Crear producto              | Admin         |
| PUT    | `/:pid` | Actualizar producto         | Admin         |
| DELETE | `/:pid` | Eliminar producto           | Admin         |

### Carritos (`/api/carts`)

| Método | Ruta                  | Descripción         | Requiere auth |
| ------ | --------------------- | ------------------- | ------------- |
| GET    | `/:cid`               | Ver carrito         | Sí            |
| POST   | `/:cid/products/:pid` | Agregar producto    | Sí            |
| PUT    | `/:cid/products/:pid` | Actualizar cantidad | Sí            |
| DELETE | `/:cid/products/:pid` | Eliminar producto   | Sí            |
| DELETE | `/:cid`               | Vaciar carrito      | Sí            |
| POST   | `/:cid/purchase`      | Procesar compra     | Sí            |

### Vistas (`/`)

| Ruta                | Descripción           | Acceso   |
| ------------------- | --------------------- | -------- |
| `/`                 | Home (login/registro) | Público  |
| `/products`         | Catálogo de productos | Público  |
| `/product/:pid`     | Detalle de producto   | Público  |
| `/cart`             | Carrito de compras    | Usuarios |
| `/profile`          | Perfil del usuario    | Usuarios |
| `/realtimeproducts` | Admin de productos    | Admin    |

## Arquitectura y seguridad

### Autenticación JWT con cookies

El sistema utiliza JWT almacenado en cookies HTTP-only para mayor seguridad:

```javascript
// Al hacer login, el token se guarda en una cookie
res.cookie("token", jwtToken, {
  httpOnly: true, // No accesible desde JavaScript
  sameSite: "strict", // Protección contra CSRF
  maxAge: 24 * 60 * 60 * 1000, // 24 horas
});
```

El middleware de autenticación extrae el token de la cookie o del header `Authorization`:

```javascript
const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies.token;
  }
  // Fallback a Authorization header
  if (!token && req.headers.authorization) {
    token = req.headers.authorization.split(" ")[1];
  }
  return token;
};
```

### Encriptación de contraseñas

Las contraseñas se hashean automáticamente con bcrypt antes de guardarse:

```javascript
// Pre-save hook en el modelo User
userSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();
  this.password = bcrypt.hashSync(this.password, 10);
  next();
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compareSync(candidatePassword, this.password);
};
```

### Protección de rutas

Se utilizan diferentes middlewares según el nivel de protección:

- **requireAuth**: Valida que el usuario esté autenticado
- **requireAdmin**: Valida que el usuario sea administrador
- **requireAuthView**: Protege vistas y redirige al login
- **redirectIfAuth**: Evita que usuarios autenticados accedan al login/registro

### Manejo de errores

Sistema centralizado de errores con clases personalizadas:

- `AppError`: Error base de la aplicación
- `ValidationError`: Errores de validación (400)
- `AuthenticationError`: Errores de autenticación (401)
- `AuthorizationError`: Errores de autorización (403)
- `NotFoundError`: Recursos no encontrados (404)
- `ConflictError`: Conflictos de datos (409)
- `InternalError`: Errores internos del servidor (500)

El middleware global captura todos los errores y retorna respuestas consistentes.

## Uso del sistema

### Registro de usuario

```bash
POST /api/sessions/register
Content-Type: application/json

{
  "first_name": "Juan",
  "last_name": "Pérez",
  "email": "juan@example.com",
  "age": 25,
  "password": "miPassword123"
}
```

### Login

```bash
POST /api/sessions/login
Content-Type: application/json

{
  "email": "juan@example.com",
  "password": "miPassword123"
}
```

La respuesta incluirá una cookie con el JWT que se enviará automáticamente en las siguientes peticiones.

### Verificar sesión

```bash
GET /api/sessions/current
```

Si el token es válido, retorna la información del usuario (sin la contraseña).

### Agregar producto al carrito

```bash
POST /api/carts/:cid/products/:pid
Content-Type: application/json

{
  "quantity": 2
}
```

### Procesar compra

```bash
POST /api/carts/:cid/purchase
```

Genera un ticket de compra, actualiza el stock y vacía el carrito.

## Características destacadas

### Sistema de notificaciones

Incluye un sistema de notificaciones toast personalizado con 4 tipos: success, error, warning e info. Las notificaciones se muestran automáticamente y desaparecen después de 5 segundos.

### Recuperación de contraseña

Los usuarios pueden solicitar un email para restablecer su contraseña. El sistema genera un token temporal que expira en 1 hora.

### Panel de administración en tiempo real

Los administradores pueden gestionar productos desde `/realtimeproducts`. Los cambios se reflejan en tiempo real gracias a Socket.io.

### Validaciones frontend y backend

Todas las operaciones están validadas tanto en el cliente como en el servidor, mejorando la experiencia de usuario y la seguridad.

## Notas de desarrollo

### Modelo de datos

El proyecto sigue el patrón DAO (Data Access Object) para abstraer el acceso a la base de datos. Cada entidad tiene su propio DAO que maneja las operaciones CRUD.

### Respuestas estandarizadas

Se utiliza la clase `ResponseUtil` para mantener un formato consistente en todas las respuestas de la API:

```json
{
  "status": "success",
  "message": "Operación exitosa",
  "data": { ... }
}
```

### DTOs (Data Transfer Objects)

Los datos del usuario se sanitizan con DTOs antes de enviarse al cliente, eliminando información sensible como contraseñas y tokens de recuperación.

## Autor

Nicolás Carcagno - Proyecto final CoderHouse Backend II

## Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.
