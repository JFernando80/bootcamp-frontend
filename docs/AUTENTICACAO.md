# Autenticação - Como Funciona

## ✅ SIM, o token é enviado AUTOMATICAMENTE em TODOS os endpoints!

Você **NÃO precisa** adicionar o token manualmente em cada chamada de API. O sistema já faz isso automaticamente.

> **⚠️ IMPORTANTE:** O header `Authorization` recebe apenas o token (string pura), **SEM** o prefixo `Bearer`.
>
> **Correto:** `Authorization: 43f327e1724afe29be9bd9c2cd327e2154defebdaacb45f42d16d37ae57e4f45`  
> **Errado:** `Authorization: Bearer 43f327e1724afe29be9bd9c2cd327e2154defebdaacb45f42d16d37ae57e4f45`

## 🔐 Como Funciona

### 1. Interceptor de Request (Automático)

O arquivo [app/api/httpClient.ts](../app/api/httpClient.ts) possui um **interceptor** que adiciona automaticamente o header de autenticação em **TODAS** as requisições:

```typescript
httpClient.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState();

  // Header 'Authorization' com JWT (apenas o token, sem Bearer)
  if (token) {
    config.headers.set("Authorization", token);
  }

  return config;
});
```

### 2. Header Enviado Automaticamente

Toda requisição para a API recebe automaticamente:

| Header          | Valor                         | Quando é enviado                     |
| --------------- | ----------------------------- | ------------------------------------ |
| `Authorization` | `{jwtToken}` (apenas o token) | Sempre que houver token no authStore |

### 3. Exemplos de Uso

#### ❌ ERRADO (não faça isso)

```typescript
// NÃO precisa passar token manualmente!
await httpClient.post("/bootcamp/course", courseData, {
  headers: {
    Authorization: token, // ❌ Desnecessário
  },
});
```

#### ✅ CORRETO (faça assim)

```typescript
// O token é adicionado automaticamente!
await apiPost("/bootcamp/course", courseData);
// ou
await courseService.create(courseData);
```

## � Estrutura do Response da API

A API retorna respostas no seguinte formato:

### Response Padrão

```typescript
{
  statusCode: 200,
  message: "ok",
  body: {
    // Dados da resposta
  }
}
```

### Response de Listagem Paginada

```typescript
{
  statusCode: 200,
  message: "ok",
  body: {
    lista: [
      {
        id: "uuid",
        slug: "curso-teste",
        title: "Curso Teste",
        description: "Descrição do curso",
        publishedAtS: null,
        createdAtS: "11/02/2026",
        updatedAtS: null
      }
    ],
    total: 1,
    pagina: 1
  }
}
```

### Propriedades do Response

| Campo         | Tipo   | Descrição                                     |
| ------------- | ------ | --------------------------------------------- |
| `statusCode`  | number | Código HTTP da resposta (200, 201, 400, etc.) |
| `message`     | string | Mensagem da resposta ("ok", "error", etc.)    |
| `body`        | object | Dados da resposta ou null                     |
| `body.lista`  | array  | Lista de itens (em respostas paginadas)       |
| `body.total`  | number | Total de páginas disponíveis                  |
| `body.pagina` | number | Número da página atual                        |

## �📋 Endpoints que Usam Autenticação Automática

### Cursos (Admin)

- ✅ `POST /bootcamp/course` - Criar curso
- ✅ `PUT /bootcamp/course` - Atualizar curso
- ✅ `DELETE /bootcamp/course?slug={slug}` - Deletar curso
- ✅ `POST /bootcamp/course/filtro/{page}` - Listar cursos com filtros e paginação (page inicia em 1)
- ✅ `GET /bootcamp/course/consulta` - Buscar campos disponíveis para filtros dinâmicos

### Módulos (Admin)

- ✅ `POST /bootcamp/module` - Criar módulo
- ✅ `PUT /bootcamp/module/{id}` - Atualizar módulo
- ✅ `DELETE /bootcamp/module/{id}` - Deletar módulo

### Atividades (Admin)

- ✅ `POST /bootcamp/activity` - Criar atividade
- ✅ `PUT /bootcamp/activity/{id}` - Atualizar atividade
- ✅ `DELETE /bootcamp/activity/{id}` - Deletar atividade

## 📄 Paginação

> **⚠️ IMPORTANTE:** Todos os endpoints de listagem com paginação iniciam na **página 1**, não na página 0.

### Endpoints de Filtro com Paginação

Todos seguem o padrão `/endpoint/filtro/{page}` onde `{page}` começa em 1:

```typescript
// ✅ CORRETO - Primeira página
await courseService.list(1, filters);
await moduleService.list(1, filters);
await activityService.list(1, filters);

// ❌ ERRADO - Página 0 não existe
await courseService.list(0, filters); // Retorna erro
```

### Body do Request

Os endpoints de filtro recebem um array de critérios de busca:

```typescript
// Buscar todos (array vazio)
POST / bootcamp / course / filtro / 1;
Body: [];

// Buscar com filtros
POST / bootcamp / course / filtro / 1;
Body: [
  { key: "slug", operation: "EQUALS", value: "curso-1" },
  { key: "title", operation: "LIKE", value: "Python" },
];
```

### Operações Disponíveis

- `EQUALS` - Igualdade exata
- `LIKE` - Busca parcial (contém)
- `GREATER_THAN` - Maior que
- `LESS_THAN` - Menor que

## 🔍 Filtros Dinâmicos

### Endpoint de Consulta de Campos

O endpoint `GET /bootcamp/course/consulta` retorna os metadados de todos os campos disponíveis para filtros:

```typescript
const response = await courseService.getFields();
// Retorna array com informações sobre cada campo:
[
  {
    id: 1120,
    variavel: "id",
    tipo: "uuid",
    header: "id",
    status: "INATIVO",
  },
  {
    id: 1122,
    variavel: "title",
    tipo: "string",
    header: "title",
    status: "INATIVO",
  },
  // ... outros campos
];
```

### Campos Disponíveis para Filtro

| Campo             | Tipo   | Descrição                    |
| ----------------- | ------ | ---------------------------- |
| `id`              | uuid   | ID do curso                  |
| `slug`            | string | Identificador único do curso |
| `title`           | string | Título do curso              |
| `description`     | string | Descrição do curso           |
| `status`          | string | Status do curso              |
| `publishedAt`     | date   | Data de publicação           |
| `ownerUser.id`    | uuid   | ID do usuário dono           |
| `ownerUser.name`  | string | Nome do usuário dono         |
| `ownerUser.email` | string | Email do usuário dono        |

### Exemplo de Filtro Avançado

```typescript
// Buscar cursos com título contendo "Python" e status "ATIVO"
const filters: SearchCriteriaDTO[] = [
  { key: "title", operation: "LIKE", value: "Python" },
  { key: "status", operation: "EQUALS", value: "ATIVO" },
];

const response = await courseService.list(1, filters);
```

### Rota de Cursos com Filtros

A aplicação possui uma rota dedicada `/courses` que permite:

- Listagem completa de todos os cursos
- Busca por título
- Filtros dinâmicos baseados nos campos retornados por `/course/consulta`
- Paginação

### Usuário

- ✅ `GET /bootcamp/user/listar` - Listar usuários (admin)
- ✅ `GET /bootcamp/user/profile` - Perfil do usuário logado

### Progresso do Usuário

- ✅ `POST /bootcamp/user-course/cadastro` - Inscrever em curso
- ✅ `GET /bootcamp/user-course/listar` - Listar cursos do usuário
- ✅ `PUT /bootcamp/user-activity/cadastro` - Registrar atividade

## 🔄 Fluxo Completo de Autenticação

### 1. Login

```typescript
// authService.ts
const response = await loginUser({ email, password });
// O login salva automaticamente no authStore:
useAuthStore
  .getState()
  .login(token, sessionId, publicKey, userName, userEmail, isAdmin);
```

### 2. Estado Persistido

O Zustand persiste automaticamente no localStorage:

```json
{
  "state": {
    "isAuthenticated": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "sessionId": 12345,
    "publicKey": "MIIBIjANBg...",
    "userName": "João Silva",
    "userEmail": "joao@email.com",
    "isAdmin": true,
    "sessionExpiry": 1739285400000
  }
}
```

### 3. Requisições Subsequentes

Todas as chamadas de API pegam automaticamente do authStore:

```typescript
// createCourse.tsx
const handleSubmit = async () => {
  // Token adicionado AUTOMATICAMENTE pelo interceptor!
  await courseService.create(courseData);
};
```

## 🚫 Interceptor de Response (Logout Automático)

Se a API retornar **401 Unauthorized**, o sistema:

1. ✅ Limpa o authStore (logout)
2. ✅ Redireciona para `/login`

```typescript
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.replace("/login");
    }
    return Promise.reject(error);
  },
);
```

## 📝 Resumo

| O que você precisa fazer        | O que o sistema faz automaticamente  |
| ------------------------------- | ------------------------------------ |
| Fazer login com `loginUser()`   | Salva token no authStore             |
| Chamar `courseService.create()` | Adiciona header Authorization        |
| Chamar qualquer endpoint        | Adiciona header Authorization        |
| Nada (API retorna 401)          | Faz logout e redireciona para /login |

## 🔍 Como Verificar

Abra o DevTools (F12) > Network > Clique em qualquer requisição > Headers:

```
Request Headers:
  Authorization: 43f327e1724afe29be9bd9c2cd327e2154defebdaacb45f42d16d37ae57e4f45
  Content-Type: application/json
```

**Importante:** O header `Authorization` recebe apenas o token (string pura), **SEM** o prefixo `Bearer`.

Se NÃO aparecer esse header, o usuário não está autenticado ou o token expirou.

## ⚠️ Endpoints que NÃO Precisam de Autenticação

Apenas esses endpoints são públicos:

- ❌ `POST /bootcamp/user/new` - Registro de novo usuário
- ❌ `POST /bootcamp/user/login` - Login
- ❌ `GET /bootcamp/security/cadastro` - Handshake para criptografia

> **⚠️ NOTA:** O endpoint de listagem de cursos `POST /bootcamp/course/filtro/{page}` atualmente requer autenticação.

**Todos os outros endpoints requerem autenticação que é adicionada automaticamente!**

## 🎯 Conclusão

**Sim, o token é SEMPRE enviado automaticamente em TODOS os endpoints protegidos!**

Você só precisa:

1. ✅ Fazer login uma vez
2. ✅ Chamar os serviços normalmente
3. ✅ O sistema cuida do resto!

Não precisa se preocupar com tokens manualmente. 🚀
