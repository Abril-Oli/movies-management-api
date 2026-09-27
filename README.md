# Movies Management API

API REST desarrollada con **NestJS**, **TypeORM** y **PostgreSQL** para la gestión de películas.

El proyecto implementa autenticación y autorización mediante **JWT**, control de acceso por roles (`user` / `admin`), operaciones CRUD sobre películas y sincronización manual con la API pública **SWAPI.tech**.

## Tecnologías

* **Node.js 24**
* **NestJS**
* **TypeScript**
* **TypeORM**
* **PostgreSQL**
* **JWT**
* **bcrypt**
* **Swagger / OpenAPI**
* **Jest**
* **Docker / Docker Compose**
* **SWAPI.tech**

## Arquitectura

El proyecto está organizado por módulos siguiendo la arquitectura de NestJS:

```text
src/
├── auth/          # Registro, login y JWT
├── users/         # Gestión de usuarios
├── roles/         # Roles y autorización
├── movies/        # Gestión y CRUD de películas
├── star-wars/     # Integración con SWAPI.tech
├── common/        # Guards, decorators y utilidades compartidas
└── main.ts        # Punto de entrada de la aplicación
```

## Requisitos

Antes de comenzar, asegurate de tener instalado:

* Node.js 24 o una versión compatible con las dependencias del proyecto.
* npm.
* Docker Desktop con Docker Compose.
* Git.

## Instalación local

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd movies-management-api
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto.

> El archivo `.env` está incluido en `.gitignore` y no debe subirse al repositorio.

Ejemplo:

```dotenv
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=movies
DB_PASSWORD=movies_dev_password
DB_NAME=movies_management

SWAPI_BASE_URL=https://www.swapi.tech/api

JWT_SECRET=replace-this-with-a-long-random-secret
```

Para entornos reales, reemplazar `JWT_SECRET` por un secreto largo y aleatorio.

También se puede utilizar `.env.example` como referencia.

### 4. Iniciar PostgreSQL

El proyecto utiliza PostgreSQL mediante Docker Compose.

```bash
docker compose up -d postgres
```

Verificar que el contenedor esté funcionando:

```bash
docker compose ps
```

### 5. Ejecutar las migraciones

```bash
npm run migration:run
```

Este comando prepara la estructura de la base de datos mediante las migraciones de TypeORM.

### 6. Crear los roles iniciales

```bash
npm run seed:roles
```

El seed es idempotente, por lo que puede ejecutarse más de una vez sin duplicar los roles existentes.

Los roles disponibles son:

* `user`
* `admin`

### 7. Iniciar la aplicación

```bash
npm run start:dev
```

La API estará disponible en:

```text
http://localhost:3000
```

La documentación Swagger estará disponible en:

```text
http://localhost:3000/api
```

---

## Autenticación y autorización

La API utiliza **JWT Bearer Authentication**.

### Roles

| Rol     | Permisos                                                       |
| ------- | -------------------------------------------------------------- |
| `user`  | Consultar películas                                            |
| `admin` | Consultar, crear, actualizar, eliminar y sincronizar películas |

Los endpoints protegidos requieren un JWT válido.

Los endpoints exclusivos de administración requieren además un usuario con rol `admin`.

---

## Flujo de autenticación

### 1. Registrar un usuario

Desde Swagger:

```text
POST /auth/sign-up
```

Body:

```json
{
  "email": "user@example.com",
  "password": "StrongPass123!"
}
```

Los usuarios registrados reciben automáticamente el rol `user`.

### 2. Iniciar sesión

```text
POST /auth/sign-in
```

Body:

```json
{
  "email": "user@example.com",
  "password": "StrongPass123!"
}
```

La respuesta devuelve un `access_token`.

### 3. Autorizar Swagger

En Swagger:

1. Ejecutar `POST /auth/sign-in`.
2. Copiar el `access_token`.
3. Seleccionar **Authorize**.
4. Ingresar el token como Bearer token.
5. Ejecutar los endpoints protegidos.

### Probar endpoints de administrador

Para probar los endpoints exclusivos de `admin`, se puede modificar el rol de un usuario local desde DBeaver o `psql`:

```sql
UPDATE users
SET "roleId" = (
  SELECT id
  FROM roles
  WHERE name = 'admin'
)
WHERE email = 'user@example.com';
```

Después de modificar el rol, iniciar sesión nuevamente para obtener un nuevo JWT.

> Los tokens emitidos anteriormente conservan el rol que tenían al momento de ser generados.

---

## Endpoints

### Autenticación

| Método | Ruta            | Acceso  | Descripción                                |
| ------ | --------------- | ------- | ------------------------------------------ |
| `POST` | `/auth/sign-up` | Público | Registra un nuevo usuario.                 |
| `POST` | `/auth/sign-in` | Público | Valida las credenciales y devuelve un JWT. |

### Roles

| Método | Ruta         | Acceso  | Descripción                  |
| ------ | ------------ | ------- | ---------------------------- |
| `GET`  | `/roles`     | `admin` | Lista los roles disponibles. |
| `GET`  | `/roles/:id` | `admin` | Obtiene un rol por ID.       |

### Películas

| Método   | Ruta                      | Acceso          | Descripción                                 |
| -------- | ------------------------- | --------------- | ------------------------------------------- |
| `GET`    | `/movies/list`            | `user`, `admin` | Lista las películas almacenadas localmente. |
| `GET`    | `/movies/item/:id`        | `user`          | Obtiene una película por ID.                |
| `POST`   | `/movies/sync`            | `admin`         | Sincroniza las películas desde SWAPI.tech.  |
| `POST`   | `/movies/create-item`     | `admin`         | Crea una película local.                    |
| `PATCH`  | `/movies/update-item/:id` | `admin`         | Actualiza una película local.               |
| `DELETE` | `/movies/delete-item/:id` | `admin`         | Elimina una película local.                 |

La documentación completa de los endpoints, parámetros y modelos está disponible en Swagger.

---

## Sincronización con SWAPI.tech

La sincronización con SWAPI.tech se ejecuta manualmente mediante:

```text
POST /movies/sync
```

El endpoint requiere autenticación y rol `admin`.

La sincronización importa o actualiza las películas obtenidas desde SWAPI.tech.

Las películas externas se identifican mediante su `swapiId`, permitiendo realizar un **upsert** y evitar duplicados.

Ejemplo de respuesta:

```json
{
  "synchronized": 6
}
```


### Pruebas unitarias

```bash
npm test -- --runInBand
```

### Cobertura

```bash
npm run test:cov -- --runInBand
```

### Compilar el proyecto

```bash
npm run build
```

### Lint

```bash
npm run lint
```

---

## Comandos útiles

### Ver estado de PostgreSQL

```bash
docker compose ps
```

### Ver logs de PostgreSQL

```bash
docker compose logs -f postgres
```

### Detener PostgreSQL conservando los datos

```bash
docker compose down
```

### Detener PostgreSQL y eliminar los datos

```bash
docker compose down -v
```

> `docker compose down -v` elimina el volumen de PostgreSQL y, por lo tanto, todos los datos almacenados localmente.

---

## Variables de entorno

| Variable         | Descripción                           |
| ---------------- | ------------------------------------- |
| `DB_HOST`        | Host de PostgreSQL                    |
| `DB_PORT`        | Puerto de PostgreSQL                  |
| `DB_USERNAME`    | Usuario de PostgreSQL                 |
| `DB_PASSWORD`    | Contraseña de PostgreSQL              |
| `DB_NAME`        | Nombre de la base de datos            |
| `SWAPI_BASE_URL` | URL base de SWAPI.tech                |
| `JWT_SECRET`     | Secreto utilizado para firmar los JWT |

---

## Documentación de la API

Una vez iniciada la aplicación, la documentación interactiva está disponible mediante Swagger:

```text
http://localhost:3000/api
```

Desde Swagger se pueden consultar los endpoints, modelos, parámetros y probar las operaciones directamente contra la API.
