# API Documentation - Bootcamp Backend

## Base URL

```
https://shiny-barbee-ferracio-72802286.koyeb.app/bootcamp
```

## Formato de Resposta

Todas as respostas seguem o padrão `JsonResponse`:

```json
{
  "status": "success",
  "message": "mensagem de retorno",
  "data": {}
}
```

## Autenticação

A maioria dos endpoints requer autenticação via header `token` ou atributo `content` injetado por interceptor.

---

## 📁 Módulo: Segurança

### Security

**Base Path:** `/security`

| Método | Endpoint             | Descrição                                   | Headers |
| ------ | -------------------- | ------------------------------------------- | ------- |
| GET    | `/security/cadastro` | Obter chaves de segurança para criptografia | -       |

**Response:**

```json
{
  "status": "success",
  "body": {
    "id": "long",
    "publicKey": "string"
  }
}
```

**Nota:** O `id` deve ser enviado no header `token` para requisições de login, e a `publicKey` deve ser usada para criptografar as credenciais.

---

## 📁 Módulo: Autenticação e Usuários

### Login

**Base Path:** `/user`

| Método | Endpoint              | Descrição       | Headers | Body                     |
| ------ | --------------------- | --------------- | ------- | ------------------------ |
| POST   | `/user/login`         | Realizar login  | `token` | `LoginDTO`               |
| POST   | `/user/refresh_token` | Atualizar token | `token` | `{refreshToken: string}` |

**LoginDTO:**

```json
{
  "login": "string" // String criptografada: CryptoJS.AES.encrypt(email + "}*{" + password, publicKey)
}
```

**Nota:** O login usa um separador especial `}*{` entre email e senha antes de criptografar.

**Refresh Token Body:**

```json
{
  "refreshToken": "string"
}
```

**TokenDTO:**

```json
{
  "token": "string",
  "refreshToken": "string"
}
```

**Nota:** A resposta de login/refresh retorna:

```json
{
  "status": "success",
  "body": {
    "tokenDTO": {
      "token": "string",
      "refreshToken": "string"
    }
  }
}
```

### User

**Base Path:** `/user`

| Método | Endpoint                | Descrição                  | Headers | Body                  | Auth Required |
| ------ | ----------------------- | -------------------------- | ------- | --------------------- | ------------- |
| POST   | `/user/new`             | Criar novo usuário         | `token` | `UserDTO`             | ✅            |
| PUT    | `/user/{id}`            | Atualizar usuário          | -       | `UserDTO`             | ✅ (content)  |
| DELETE | `/user/{id}`            | Deletar usuário            | -       | -                     | ✅ (content)  |
| POST   | `/user/filtro/{pagina}` | Listar usuários com filtro | -       | `SearchCriteriaDTO[]` | ✅ (content)  |
| GET    | `/user/consulta`        | Buscar campos disponíveis  | -       | -                     | ✅ (content)  |

**UserDTO:**

```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "sobrenome": "string",
  "passwordHash": "string", // CryptoJS.AES.encrypt(password, publicKey).toString()
  "administrador": "boolean" // Se o usuário é administrador
  // outros campos...
}
```

**Nota:**

- Para criar usuário, a `passwordHash` deve ser: `CryptoJS.AES.encrypt(password, publicKey)`
- A `publicKey` é a **chave de criptografia AES**, não deve ser concatenada com a senha
- Enviar header `token` com o ID da segurança obtido em `/security/cadastro`

---

## 📁 Módulo: Administração

### Token

**Base Path:** `/token`

| Método | Endpoint                 | Descrição                 | Body                  | Auth Required |
| ------ | ------------------------ | ------------------------- | --------------------- | ------------- |
| POST   | `/token`                 | Criar token               | `TokenDTO`            | ✅ (content)  |
| PUT    | `/token/{id}`            | Atualizar token           | `TokenDTO`            | ✅ (content)  |
| DELETE | `/token/{id}`            | Deletar token             | -                     | ✅ (content)  |
| POST   | `/token/filtro/{pagina}` | Listar tokens com filtro  | `SearchCriteriaDTO[]` | ✅ (content)  |
| GET    | `/token/consulta`        | Buscar campos disponíveis | -                     | ✅ (content)  |

### Permission

**Base Path:** `/permission`

| Método | Endpoint                      | Descrição                    | Body                  | Auth Required |
| ------ | ----------------------------- | ---------------------------- | --------------------- | ------------- |
| POST   | `/permission`                 | Criar permissão              | `PermissionDTO`       | ✅ (content)  |
| PUT    | `/permission/{id}`            | Atualizar permissão          | `PermissionDTO`       | ✅ (content)  |
| DELETE | `/permission/{id}`            | Deletar permissão            | -                     | ✅ (content)  |
| POST   | `/permission/filtro/{pagina}` | Listar permissões com filtro | `SearchCriteriaDTO[]` | ✅ (content)  |
| GET    | `/permission/consulta`        | Buscar campos disponíveis    | -                     | ✅ (content)  |

**PermissionDTO:**

```json
{
  "id": "long",
  "name": "string",
  "description": "string"
  // outros campos...
}
```

### Permission Group

**Base Path:** `/permission_group`

| Método | Endpoint                            | Descrição                    | Body                  | Auth Required |
| ------ | ----------------------------------- | ---------------------------- | --------------------- | ------------- |
| POST   | `/permission_group`                 | Criar grupo de permissão     | `PermissionGroupDTO`  | ✅ (content)  |
| PUT    | `/permission_group/{id}`            | Atualizar grupo de permissão | `PermissionGroupDTO`  | ✅ (content)  |
| DELETE | `/permission_group/{id}`            | Deletar grupo de permissão   | -                     | ✅ (content)  |
| POST   | `/permission_group/filtro/{pagina}` | Listar grupos com filtro     | `SearchCriteriaDTO[]` | ✅ (content)  |
| GET    | `/permission_group/consulta`        | Buscar campos disponíveis    | -                     | ✅ (content)  |

### Permission Type

**Base Path:** `/permission_type`

| Método | Endpoint                           | Descrição                   | Body                  | Auth Required |
| ------ | ---------------------------------- | --------------------------- | --------------------- | ------------- |
| POST   | `/permission_type`                 | Criar tipo de permissão     | `PermissionTypeDTO`   | ✅ (content)  |
| PUT    | `/permission_type/{id}`            | Atualizar tipo de permissão | `PermissionTypeDTO`   | ✅ (content)  |
| DELETE | `/permission_type/{id}`            | Deletar tipo de permissão   | -                     | ✅ (content)  |
| POST   | `/permission_type/filtro/{pagina}` | Listar tipos com filtro     | `SearchCriteriaDTO[]` | ✅ (content)  |
| GET    | `/permission_type/consulta`        | Buscar campos disponíveis   | -                     | ✅ (content)  |

### User Permission Type

**Base Path:** `/user_permission_type`

| Método | Endpoint                                | Descrição                      | Body                    | Auth Required |
| ------ | --------------------------------------- | ------------------------------ | ----------------------- | ------------- |
| POST   | `/user_permission_type`                 | Criar permissão de usuário     | `UserPermissionTypeDTO` | ✅ (content)  |
| PUT    | `/user_permission_type/{id}`            | Atualizar permissão de usuário | `UserPermissionTypeDTO` | ✅ (content)  |
| DELETE | `/user_permission_type/{id}`            | Deletar permissão de usuário   | -                       | ✅ (content)  |
| POST   | `/user_permission_type/filtro/{pagina}` | Listar permissões com filtro   | `SearchCriteriaDTO[]`   | ✅ (content)  |
| GET    | `/user_permission_type/consulta`        | Buscar campos disponíveis      | -                       | ✅ (content)  |

### Perfil Permission Type

**Base Path:** `/perfil_permission_type`

| Método | Endpoint                                  | Descrição                     | Body                      | Auth Required |
| ------ | ----------------------------------------- | ----------------------------- | ------------------------- | ------------- |
| POST   | `/perfil_permission_type`                 | Criar permissão de perfil     | `PerfilPermissionTypeDTO` | ✅ (content)  |
| PUT    | `/perfil_permission_type/{id}`            | Atualizar permissão de perfil | `PerfilPermissionTypeDTO` | ✅ (content)  |
| DELETE | `/perfil_permission_type/{id}`            | Deletar permissão de perfil   | -                         | ✅ (content)  |
| POST   | `/perfil_permission_type/filtro/{pagina}` | Listar permissões com filtro  | `SearchCriteriaDTO[]`     | ✅ (content)  |
| GET    | `/perfil_permission_type/consulta`        | Buscar campos disponíveis     | -                         | ✅ (content)  |

### Admin Enums

**Base Path:** `/admin_enums`

| Método | Endpoint | Descrição                             | Auth Required |
| ------ | -------- | ------------------------------------- | ------------- |
| -      | -        | (Nenhum endpoint definido atualmente) | -             |

---

## 📁 Módulo: Formação/Cursos

### Course

**Base Path:** `/course`

| Método | Endpoint                  | Descrição                 | Headers         | Body                  | Auth Required |
| ------ | ------------------------- | ------------------------- | --------------- | --------------------- | ------------- |
| POST   | `/course`                 | Criar curso               | `authorization` | `CourseDTO`           | ✅            |
| PUT    | `/course/{id}`            | Atualizar curso           | `authorization` | `CourseDTO`           | ✅            |
| DELETE | `/course/{id}`            | Deletar curso             | `authorization` | -                     | ✅            |
| POST   | `/course/filtro/{pagina}` | Listar cursos com filtro  | `authorization` | `SearchCriteriaDTO[]` | ✅            |
| GET    | `/course/consulta`        | Buscar campos disponíveis | `authorization` | -                     | ✅            |

**CourseDTO:**

```json
{
  "id": "uuid",
  "slug": "string",
  "title": "string", // min: 10, max: 100
  "description": "string", // min: 10, max: 300
  "publishedAtS": "string", // Data de publicação (formato: dd/MM/yyyy)
  "createdAtS": "string", // Data de criação (formato: dd/MM/yyyy)
  "updatedAtS": "string" // Data de atualização (formato: dd/MM/yyyy)
}
```

### Module

**Base Path:** `/module`

| Método | Endpoint                  | Descrição                 | Headers         | Body                  | Auth Required |
| ------ | ------------------------- | ------------------------- | --------------- | --------------------- | ------------- |
| POST   | `/module`                 | Criar módulo              | `authorization` | `ModuleDTO`           | ✅            |
| PUT    | `/module/{id}`            | Atualizar módulo          | `authorization` | `ModuleDTO`           | ✅            |
| DELETE | `/module/{id}`            | Deletar módulo            | `authorization` | -                     | ✅            |
| POST   | `/module/filtro/{pagina}` | Listar módulos com filtro | `authorization` | `SearchCriteriaDTO[]` | ✅            |
| GET    | `/module/consulta`        | Buscar campos disponíveis | `authorization` | -                     | ✅            |

**ModuleDTO:**

```json
{
  "id": "uuid",
  "index": "number", // Ordem do módulo no curso
  "title": "string", // Nome do módulo
  "description": "string",
  "requiredToCompleteCourse": "boolean", // Se é obrigatório para completar o curso
  "createdAtS": "string", // Data de criação (formato: dd/MM/yyyy)
  "updatedAtS": "string", // Data de atualização (formato: dd/MM/yyyy)
  "courseId": "uuid",
  "courseDescription": "string" // Descrição do curso associado
}
```

### Activity

**Base Path:** `/activity`

| Método | Endpoint                    | Descrição                    | Headers         | Body                  | Auth Required |
| ------ | --------------------------- | ---------------------------- | --------------- | --------------------- | ------------- |
| POST   | `/activity`                 | Criar atividade              | `authorization` | `ActivityDTO`         | ✅            |
| PUT    | `/activity/{id}`            | Atualizar atividade          | `authorization` | `ActivityDTO`         | ✅            |
| DELETE | `/activity/{id}`            | Deletar atividade            | `authorization` | -                     | ✅            |
| POST   | `/activity/filtro/{pagina}` | Listar atividades com filtro | `authorization` | `SearchCriteriaDTO[]` | ✅            |
| GET    | `/activity/consulta`        | Buscar campos disponíveis    | `authorization` | -                     | ✅            |

**ActivityDTO:**

```json
{
  "id": "uuid",
  "type": "string", // Tipo da atividade
  "configJson": "string", // Configuração em JSON
  "maxScore": "number", // Pontuação máxima
  "passingScore": "number", // Pontuação mínima para passar
  "createdAtS": "string", // Data de criação (formato: dd/MM/yyyy)
  "updatedAtS": "string", // Data de atualização (formato: dd/MM/yyyy)
  "moduleId": "uuid",
  "moduleDescription": "string" // Descrição do módulo associado
}
```

### User Course

**Base Path:** `/user_course`

| Método | Endpoint                       | Descrição                       | Body                  | Auth Required |
| ------ | ------------------------------ | ------------------------------- | --------------------- | ------------- |
| POST   | `/user_course`                 | Criar relação usuário-curso     | `UserCourseDTO`       | ✅ (content)  |
| PUT    | `/user_course/{id}`            | Atualizar relação usuário-curso | `UserCourseDTO`       | ✅ (content)  |
| DELETE | `/user_course/{id}`            | Deletar relação usuário-curso   | -                     | ✅ (content)  |
| POST   | `/user_course/filtro/{pagina}` | Listar relações com filtro      | `SearchCriteriaDTO[]` | ✅ (content)  |
| GET    | `/user_course/consulta`        | Buscar campos disponíveis       | -                     | ✅ (content)  |

**UserCourseDTO:**

```json
{
  "id": "uuid",
  "userId": "uuid",
  "courseId": "uuid",
  "status": "string"
  // outros campos...
}
```

### User Module

**Base Path:** `/user_module`

| Método | Endpoint                       | Descrição                        | Body                  | Auth Required |
| ------ | ------------------------------ | -------------------------------- | --------------------- | ------------- |
| POST   | `/user_module`                 | Criar relação usuário-módulo     | `UserModuleDTO`       | ✅ (content)  |
| PUT    | `/user_module/{id}`            | Atualizar relação usuário-módulo | `UserModuleDTO`       | ✅ (content)  |
| DELETE | `/user_module/{id}`            | Deletar relação usuário-módulo   | -                     | ✅ (content)  |
| POST   | `/user_module/filtro/{pagina}` | Listar relações com filtro       | `SearchCriteriaDTO[]` | ✅ (content)  |
| GET    | `/user_module/consulta`        | Buscar campos disponíveis        | -                     | ✅ (content)  |

**UserModuleDTO:**

```json
{
  "id": "uuid",
  "userId": "uuid",
  "moduleId": "uuid",
  "status": "string"
  // outros campos...
}
```

### User Activity

**Base Path:** `/user_activity`

| Método | Endpoint                         | Descrição                           | Body                  | Auth Required |
| ------ | -------------------------------- | ----------------------------------- | --------------------- | ------------- |
| POST   | `/user_activity`                 | Criar relação usuário-atividade     | `UserActivityDTO`     | ✅ (content)  |
| PUT    | `/user_activity/{id}`            | Atualizar relação usuário-atividade | `UserActivityDTO`     | ✅ (content)  |
| DELETE | `/user_activity/{id}`            | Deletar relação usuário-atividade   | -                     | ✅ (content)  |
| POST   | `/user_activity/filtro/{pagina}` | Listar relações com filtro          | `SearchCriteriaDTO[]` | ✅ (content)  |
| GET    | `/user_activity/consulta`        | Buscar campos disponíveis           | -                     | ✅ (content)  |

**UserActivityDTO:**

```json
{
  "id": "uuid",
  "userId": "uuid",
  "activityId": "uuid",
  "status": "string",
  "completed": "boolean"
  // outros campos...
}
```

### Formação Enums

**Base Path:** `/formacao_enums`

| Método | Endpoint                            | Descrição                       | Auth Required |
| ------ | ----------------------------------- | ------------------------------- | ------------- |
| GET    | `/formacao_enums/status_course/all` | Listar todos os status de curso | -             |

**Response:**

```json
{
  "status": "success",
  "data": [
    {
      "key": "ACTIVE",
      "value": "Ativo"
    },
    {
      "key": "INACTIVE",
      "value": "Inativo"
    }
    // outros status...
  ]
}
```

---

## 🔍 Estrutura de Filtros

### SearchCriteriaDTO

Usado nos endpoints de filtro para busca avançada:

```json
[
  {
    "key": "name",
    "operation": "LIKE",
    "value": "teste"
  },
  {
    "key": "status",
    "operation": "EQUALS",
    "value": "ACTIVE"
  }
]
```

**Operações disponíveis:**

- `EQUALS` - Igual
- `LIKE` - Contém (case insensitive)
- `GREATER_THAN` - Maior que
- `LESS_THAN` - Menor que
- `GREATER_THAN_OR_EQUAL` - Maior ou igual
- `LESS_THAN_OR_EQUAL` - Menor ou igual
- `NOT_EQUALS` - Diferente

### Paginação

Os endpoints de filtro retornam dados paginados:

**Request:**

- `{pagina}` - Número da página (path param)
- Offset padrão: 10 registros por página (configurado em `application.properties`)

**Response:**

```json
{
  "status": "success",
  "data": {
    "content": [], // Array com os registros
    "totalElements": 100,
    "totalPages": 10,
    "number": 0,
    "size": 10,
    "first": true,
    "last": false
  }
}
```

---

## 📝 Notas Importantes

1. **Tipos de ID:**
   - `UUID` para: User, Activity, Module, Course, UserActivity, UserModule, UserCourse
   - `Long` para: Token, Permission, PermissionGroup, PermissionType, UserPermissionType, PerfilPermissionType, Security

2. **Autenticação e Segurança:**
   - **Passo 1:** Obter chaves de segurança em `/security/cadastro` (retorna `id` e `publicKey`)
   - **Passo 2:** Criptografar credenciais usando a `publicKey` como chave AES
     - **Registro**: `passwordHash = CryptoJS.AES.encrypt(password, publicKey)`
     - **Login**: `login = CryptoJS.AES.encrypt(email + "}*{" + password, publicKey)`
   - **Passo 3:** Fazer login em `/user/login` com header `token: {security_id}` e body `{login: encrypted_credentials}`
   - **Passo 4:** Usar o `token` retornado no header `authorization` para endpoints autenticados
   - **Ferramenta de criptografia**: [CryptoJS AES Encrypt/Decrypt](https://stackblitz.com/edit/cryptojs-aes-encrypt-decrypt?file=index.js)

3. **Headers:**
   - `token`: Usado para login e refresh token (contém o security ID)
   - `authorization`: Usado para endpoints autenticados (contém o token JWT retornado no login)

4. **Formato de Datas:**
   - Campos com sufixo `S` (ex: `createdAtS`, `updatedAtS`) usam formato string `dd/MM/yyyy`
   - Exemplo: `"11/02/2026"`

5. **Endpoint de Consulta:**
   - Cada módulo possui um endpoint `/consulta`
   - Retorna os campos disponíveis para filtros e visualização
   - Útil para gerar formulários dinâmicos

6. **Filtros:**
   - Operação `EQUAL` (não `EQUALS`) é usada em alguns filtros
   - Valores numéricos não precisam de aspas no JSON
   - Exemplo: `{"key": "index", "operation": "EQUAL", "value": 2}`

7. **Mensagens de Sucesso:**
   - Todas as operações de criação retornam: `"{entidade} salvo com sucesso"`
   - Atualização: `"{entidade} atualizado com sucesso"`
   - Exclusão: `"{entidade} excluido com sucesso"`

---

## 🚀 Exemplos de Uso

### 1. Obter Chaves de Segurança

```javascript
const securityResponse = await fetch(
  "https://shiny-barbee-ferracio-72802286.koyeb.app/bootcamp/security/cadastro",
  {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  },
);

const { body } = await securityResponse.json();
const { id: securityId, publicKey } = body;

// Usar publicKey para criptografar credenciais
// Usar securityId no header 'token' para login
```

### 2. Login

```javascript
import CryptoJS from "crypto-js";

// Formato: email + "}*{" + password, depois criptografar
const email = "usuario@exemplo.com";
const password = "minhaSenha123";
const credentials = `${email}}*{${password}`;
const encryptedLogin = CryptoJS.AES.encrypt(credentials, publicKey).toString();

const response = await fetch(
  "https://shiny-barbee-ferracio-72802286.koyeb.app/bootcamp/user/login",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      token: securityId, // ID obtido do endpoint /security/cadastro
    },
    body: JSON.stringify({
      login: encryptedLogin,
    }),
  },
);

const loginData = await response.json();
const { token, refreshToken } = loginData.body.tokenDTO;

// Usar o token no header 'authorization' para requisições autenticadas
```

### 3. Criar Novo Usuário

```javascript
import CryptoJS from "crypto-js";

const response = await fetch(
  "https://shiny-barbee-ferracio-72802286.koyeb.app/bootcamp/user/new",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      token: securityId, // ID da segurança
    },
    body: JSON.stringify({
      name: "João",
      sobrenome: "Silva",
      email: "joao.silva@exemplo.com",
      passwordHash: CryptoJS.AES.encrypt("minhaSenha123", publicKey).toString(),
      administrador: false,
    }),
  },
);
```

### 4. Listar Cursos com Filtro

```javascript
const response = await fetch(
  "https://shiny-barbee-ferracio-72802286.koyeb.app/bootcamp/course/filtro/1",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: token, // Token obtido no login
    },
    body: JSON.stringify([
      {
        key: "title",
        operation: "LIKE",
        value: "AWS",
      },
    ]),
  },
);
```

### 5. Criar Novo Curso

```javascript
const response = await fetch(
  "https://shiny-barbee-ferracio-72802286.koyeb.app/bootcamp/course",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: token,
    },
    body: JSON.stringify({
      slug: "curso-aws-2026",
      title: "Curso de AWS",
      description: "Aprenda Amazon Web Services do zero ao avançado",
      createdAtS: "11/02/2026",
    }),
  },
);
```

### 6. Atualizar Curso

```javascript
const courseId = "b8b0ca27-5ad1-4158-904d-a5b91f90c537";
const response = await fetch(
  `https://shiny-barbee-ferracio-72802286.koyeb.app/bootcamp/course/${courseId}`,
  {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      authorization: token,
    },
    body: JSON.stringify({
      slug: "curso-aws-2026",
      title: "Curso de AWS - Edição 2026",
      description: "AWS do zero ao avançado com certificação",
      createdAtS: "09/02/2026",
    }),
  },
);
```

### 7. Deletar Curso

```javascript
const courseId = "b8b0ca27-5ad1-4158-904d-a5b91f90c537";
const response = await fetch(
  `https://shiny-barbee-ferracio-72802286.koyeb.app/bootcamp/course/${courseId}`,
  {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      authorization: token,
    },
  },
);
```

### 8. Criar Módulo

```javascript
const response = await fetch(
  "https://shiny-barbee-ferracio-72802286.koyeb.app/bootcamp/module",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: token,
    },
    body: JSON.stringify({
      index: 1,
      title: "Introdução à AWS",
      description: "Conceitos básicos de cloud computing e AWS",
      requiredToCompleteCourse: true,
      createdAtS: "11/02/2026",
      courseId: "b8b0ca27-5ad1-4158-904d-a5b91f90c537",
      courseDescription: "Curso de AWS - Edição 2026",
    }),
  },
);
```

### 9. Criar Atividade

```javascript
const response = await fetch(
  "https://shiny-barbee-ferracio-72802286.koyeb.app/bootcamp/activity",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: token,
    },
    body: JSON.stringify({
      type: "VIDEO",
      configJson: JSON.stringify({
        videoUrl: "https://example.com/video.mp4",
        duration: 600,
      }),
      maxScore: 100,
      passingScore: 70,
      createdAtS: "11/02/2026",
      moduleId: "7834f330-62e5-4e84-bd00-1e9f308214f4",
      moduleDescription: "Introdução à AWS",
    }),
  },
);
```

### 10. Refresh Token

```javascript
const response = await fetch(
  "https://shiny-barbee-ferracio-72802286.koyeb.app/bootcamp/user/refresh_token",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      token: securityId,
    },
    body: JSON.stringify({
      refreshToken: refreshToken,
    }),
  },
);

const refreshData = await response.json();
const { token: newToken, refreshToken: newRefreshToken } =
  refreshData.body.tokenDTO;
```

---

## ⚠️ Tratamento de Erros

Em caso de erro, a API retorna:

```json
{
  "status": "error",
  "message": "Mensagem de erro descritiva",
  "data": null
}
```

Códigos HTTP comuns:

- `200` - Sucesso
- `400` - Bad Request (dados inválidos)
- `401` - Não autorizado
- `403` - Sem permissão
- `404` - Não encontrado
- `500` - Erro interno do servidor

---

**Gerado em:** 06/02/2026  
**Versão da API:** 1.0  
**Contexto da Aplicação:** /bootcamp  
**Host:** shiny-barbee-ferracio-72802286.koyeb.app
