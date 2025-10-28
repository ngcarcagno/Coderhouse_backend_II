# 🛒 E-commerce API con Sistema de Autenticación JWT

API REST para e-commerce con sistema completo de autenticación y autorización usando JWT (JSON Web Tokens), Passport.js y bcrypt.

---

## 📋 TABLA DE CONTENIDOS

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Endpoints](#-endpoints)
- [Arquitectura](#-arquitectura)
- [Seguridad](#-seguridad)
- [Testing](#-testing)

---

## ✨ CARACTERÍSTICAS

- ✅ **CRUD de Usuarios** completo
- ✅ **Registro y Login** con validación
- ✅ **Encriptación de contraseñas** con bcrypt
- ✅ **Autenticación JWT** stateless
- ✅ **Autorización basada en roles** (user/admin)
- ✅ **Validación de tokens** con Passport.js
- ✅ **Endpoint /current** para validar sesión
- ✅ **Carrito automático** al registrarse
- ✅ **Conexión a MongoDB Atlas**

---

## 🛠️ TECNOLOGÍAS

| Tecnología             | Propósito                        |
| ---------------------- | -------------------------------- |
| **Node.js + Express**  | Backend framework                |
| **MongoDB + Mongoose** | Base de datos NoSQL              |
| **bcrypt**             | Encriptación de contraseñas      |
| **jsonwebtoken**       | Generación y verificación de JWT |
| **Passport.js**        | Middleware de autenticación      |
| **passport-jwt**       | Estrategia JWT para Passport     |
| **Socket.io**          | WebSockets para tiempo real      |
| **Handlebars**         | Motor de plantillas              |

---

## 📁 ESTRUCTURA DEL PROYECTO

```
api-server-express/
│
├── config/
│   └── config.js              # Configuración general (DB, paths, env)
│
├── src/
│   ├── config/
│   │   └── passport.config.js # Configuración de Passport y estrategias JWT
│   │
│   ├── controllers/
│   │   ├── sessions.controller.js  # Lógica de registro/login/current
│   │   ├── products.controller.js
│   │   └── carts.controller.js
│   │
│   ├── dao/                   # Data Access Objects
│   │   ├── products.dao.db.js
│   │   └── carts.dao.db.js
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js      # Middlewares de autenticación
│   │   └── upload.middleware.js
│   │
│   ├── models/
│   │   ├── user.model.js      # ⭐ Modelo User con encriptación
│   │   ├── cart.model.js
│   │   └── product.model.js
│   │
│   ├── routes/
│   │   ├── sessions.routes.js # ⭐ Rutas de autenticación
│   │   ├── products.routes.js
│   │   ├── carts.routes.js
│   │   └── index.js
│   │
│   ├── services/
│   │   ├── products.service.js
│   │   └── carts.service.js
│   │
│   ├── utils/
│   │   ├── jwt.utils.js       # ⭐ Utilidades para JWT
│   │   └── helpers.js
│   │
│   └── views/                 # Plantillas Handlebars
│
├── .env                       # Variables de entorno (¡NO subir a Git!)
├── package.json
└── server.js                  # Punto de entrada
```

---

## 🚀 INSTALACIÓN

### 1. Clonar el repositorio

```bash
git clone <tu-repositorio>
cd api-server-express
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Edita el archivo `.env` con tus credenciales:

```env
# MongoDB
MONGO_URI=mongodb+srv://<USER>:<PASSWORD>@<CLUSTER>/<DB_NAME>
DB_NAME=NeumaJet
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_CLUSTER=tu_cluster.mongodb.net

# Servidor
NODE_ENV=development
PORT=8080

# JWT
JWT_SECRET=tu_clave_super_secreta_cambiar_en_produccion_2024
```

### 4. Iniciar el servidor

```bash
# Modo desarrollo (con nodemon)
npm run dev

# Modo producción
npm start
```

El servidor estará corriendo en `http://localhost:8080`

---

## ⚙️ CONFIGURACIÓN

### MongoDB Atlas

1. Crea una cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea un cluster gratuito
3. Crea un usuario de base de datos
4. Obtén la URI de conexión
5. Configúrala en `.env`

### JWT Secret

La clave secreta JWT debe ser una cadena larga y aleatoria:

```bash
# Generar una clave segura (en terminal):
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 🔐 ENDPOINTS

### Autenticación

| Método | Endpoint                 | Descripción                  | Auth Requerida |
| ------ | ------------------------ | ---------------------------- | -------------- |
| POST   | `/api/sessions/register` | Registrar nuevo usuario      | No             |
| POST   | `/api/sessions/login`    | Iniciar sesión (obtener JWT) | No             |
| GET    | `/api/sessions/current`  | Obtener usuario actual       | **Sí** ✅      |
| POST   | `/api/sessions/logout`   | Cerrar sesión (informativo)  | No             |

### Productos

| Método | Endpoint            | Descripción             | Auth Requerida |
| ------ | ------------------- | ----------------------- | -------------- |
| GET    | `/api/products`     | Listar productos        | No             |
| GET    | `/api/products/:id` | Obtener producto por ID | No             |
| POST   | `/api/products`     | Crear producto          | Opcional       |
| PUT    | `/api/products/:id` | Actualizar producto     | Opcional       |
| DELETE | `/api/products/:id` | Eliminar producto       | Opcional       |

### Carritos

| Método | Endpoint                        | Descripción       | Auth Requerida |
| ------ | ------------------------------- | ----------------- | -------------- |
| GET    | `/api/carts/:cid`               | Obtener carrito   | No             |
| POST   | `/api/carts`                    | Crear carrito     | No             |
| POST   | `/api/carts/:cid/products/:pid` | Agregar producto  | No             |
| DELETE | `/api/carts/:cid/products/:pid` | Eliminar producto | No             |

---

## 🏗️ ARQUITECTURA

### 1. Modelo de Usuario (`user.model.js`)

```javascript
{
  first_name: String,      // Nombre del usuario
  last_name: String,       // Apellido
  email: String,           // Email único
  age: Number,             // Edad (mínimo 18)
  password: String,        // Contraseña hasheada
  cart: ObjectId,          // Referencia al carrito
  role: String,            // "user" o "admin"
  createdAt: Date,         // Timestamp automático
  updatedAt: Date          // Timestamp automático
}
```

**Características:**

- ✅ Pre-save hook que hashea automáticamente la contraseña
- ✅ Método `comparePassword()` para validar login
- ✅ Método `toJSON()` que excluye el password en respuestas
- ✅ Validaciones de formato y longitud

### 2. Flujo de Autenticación

```
┌─────────────┐
│   REGISTRO  │
└──────┬──────┘
       │
       ├─► Validar datos
       ├─► Verificar email único
       ├─► Crear carrito vacío
       ├─► Hashear password (bcrypt)
       ├─► Guardar en MongoDB
       └─► Generar JWT y retornar
           │
           ▼
┌─────────────┐
│    LOGIN    │
└──────┬──────┘
       │
       ├─► Buscar usuario por email
       ├─► Comparar password con hash
       ├─► Si coincide: Generar JWT
       └─► Retornar token
           │
           ▼
┌─────────────┐
│  PROTEGER   │
│   RUTAS     │
└──────┬──────┘
       │
       ├─► Cliente envía: Authorization: Bearer <token>
       ├─► Middleware extrae y verifica token
       ├─► Passport valida con estrategia JWT
       ├─► Busca usuario en BD
       └─► Agrega req.user y continúa
```

### 3. JWT (JSON Web Token)

Un JWT consta de 3 partes separadas por puntos:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyIsImVtYWlsIjoidGVzdEB0ZXN0LmNvbSJ9.signature
│                                        │                                       │
└─ HEADER (algoritmo y tipo)             └─ PAYLOAD (datos del usuario)         └─ SIGNATURE (firma)
```

**Contenido del Payload:**

```json
{
  "id": "673e2a5b8f9c1a2b3c4d5e70",
  "email": "usuario@example.com",
  "role": "user",
  "iat": 1732104000, // Issued At (fecha de creación)
  "exp": 1732190400 // Expiration (fecha de expiración: 24h)
}
```

### 4. Estrategia Passport JWT

```javascript
// Configuración
passport.use(
  new JwtStrategy(options, async (payload, done) => {
    // payload = datos decodificados del token
    const user = await User.findById(payload.id);

    if (!user) return done(null, false);

    return done(null, user); // req.user = user
  })
);
```

**Opciones:**

- `jwtFromRequest`: Extrae el token del header `Authorization: Bearer <token>`
- `secretOrKey`: Clave secreta para verificar la firma

---

## 🔒 SEGURIDAD

### Encriptación de Contraseñas

```javascript
// Hasheo automático en el modelo
userSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();

  this.password = bcrypt.hashSync(this.password, 10);
  next();
});

// Comparación segura
user.comparePassword = function (candidatePassword) {
  return bcrypt.compareSync(candidatePassword, this.password);
};
```

**¿Por qué bcrypt?**

- ✅ Hash de una vía (no se puede revertir)
- ✅ Salt automático (cada hash es único)
- ✅ Ajustable (saltRounds controla la seguridad)
- ✅ Resistente a rainbow tables

### Protección de Rutas

```javascript
// Ruta pública (sin autenticación)
router.get("/products", controller.getAll);

// Ruta protegida (requiere autenticación)
router.get("/current", requireAuth, controller.current);

// Ruta solo para admins (requiere autenticación + rol admin)
router.delete("/products/:id", requireAuth, requireAdmin, controller.delete);
```

### Buenas Prácticas Implementadas

✅ Contraseñas hasheadas con bcrypt (saltRounds=10)  
✅ JWT con expiración de 24 horas  
✅ Secret key en variables de entorno  
✅ Validación de emails únicos  
✅ CORS configurado  
✅ Password excluido de respuestas JSON  
✅ Manejo de errores centralizado

---

## 🧪 TESTING

Consulta la [Guía de Testing](GUIA_TESTING.md) para ejemplos detallados.

### Testing Rápido con cURL

```bash
# 1. Registrar usuario
curl -X POST http://localhost:8080/api/sessions/register \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Juan","last_name":"Pérez","email":"juan@test.com","age":25,"password":"pass123"}'

# 2. Login (guarda el token)
TOKEN=$(curl -X POST http://localhost:8080/api/sessions/login \
  -H "Content-Type: application/json" \
  -d '{"email":"juan@test.com","password":"pass123"}' \
  | jq -r '.data.token')

# 3. Verificar sesión
curl -X GET http://localhost:8080/api/sessions/current \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📚 CONCEPTOS CLAVE

### Diferencia entre Autenticación y Autorización

| Autenticación                | Autorización               |
| ---------------------------- | -------------------------- |
| **"¿Quién eres?"**           | **"¿Qué puedes hacer?"**   |
| Verificar identidad (login)  | Verificar permisos (roles) |
| Usuario + contraseña → Token | Token → req.user.role      |
| Middleware: `requireAuth`    | Middleware: `requireAdmin` |

### Stateless vs Stateful

| JWT (Stateless)                  | Sessions (Stateful)             |
| -------------------------------- | ------------------------------- |
| No guarda estado en servidor     | Guarda sesión en servidor       |
| Token contiene toda la info      | Token es solo un ID de sesión   |
| Escalable horizontalmente        | Requiere sesiones compartidas   |
| No se puede invalidar fácilmente | Se puede invalidar del servidor |

---

## 🎯 CUMPLIMIENTO DE CRITERIOS

### ✅ Criterios Implementados

| Criterio                             | Estado | Detalles                             |
| ------------------------------------ | ------ | ------------------------------------ |
| Modelo User con campos requeridos    | ✅     | `user.model.js` con todos los campos |
| Encriptación con bcrypt.hashSync     | ✅     | Pre-save hook en el modelo           |
| Estrategias de Passport configuradas | ✅     | `passport.config.js` con JWT         |
| Sistema de login con JWT             | ✅     | `sessions.controller.js`             |
| Endpoint /api/sessions/current       | ✅     | Protegido con requireAuth            |
| Estrategia "current"                 | ✅     | Configurada en Passport              |
| Validación de token JWT              | ✅     | Middleware requireAuth               |
| Error apropiado en token inválido    | ✅     | Status 401 con mensaje               |

---

## 🚧 PRÓXIMAS MEJORAS

- [ ] Refresh tokens para mayor seguridad
- [ ] Rate limiting para prevenir ataques
- [ ] Recuperación de contraseña por email
- [ ] Verificación de email al registrarse
- [ ] OAuth (Google, Facebook)
- [ ] Roles más granulares (vendedor, moderador, etc)
- [ ] Logs de actividad de usuarios
- [ ] Tests automatizados con Jest

---

## 📖 RECURSOS

- [JWT.io](https://jwt.io/) - Decodificar tokens
- [bcrypt docs](https://github.com/kelektiv/node.bcrypt.js) - Documentación de bcrypt
- [Passport.js](http://www.passportjs.org/) - Documentación oficial
- [MongoDB University](https://university.mongodb.com/) - Cursos gratuitos

---

## 👨‍💻 AUTOR

Desarrollado como parte del proyecto final del curso de Backend.

---
