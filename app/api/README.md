# Estrutura da API

Este projeto está integrado com a API backend do Bootcamp. Abaixo está a estrutura de pastas e arquivos relacionados à API:

## Estrutura de Arquivos

```
app/
├── api/
│   ├── types/              # Definições de tipos TypeScript
│   │   ├── common.ts       # Tipos comuns (JsonResponse, PaginatedResponse, etc.)
│   │   ├── auth.ts         # Tipos de autenticação
│   │   ├── course.ts       # Tipos de cursos, módulos e atividades
│   │   ├── permission.ts   # Tipos de permissões
│   │   └── index.ts        # Exportação central
│   │
│   ├── services/           # Serviços para consumir endpoints da API
│   │   ├── courseService.ts        # CRUD de cursos
│   │   ├── moduleService.ts        # CRUD de módulos
│   │   ├── activityService.ts      # CRUD de atividades
│   │   ├── userCourseService.ts    # Relação usuário-curso
│   │   ├── userModuleService.ts    # Relação usuário-módulo
│   │   ├── userActivityService.ts  # Relação usuário-atividade
│   │   ├── userService.ts          # CRUD de usuários
│   │   ├── permissionService.ts    # Gerenciamento de permissões
│   │   ├── enumService.ts          # Enums e constantes
│   │   └── index.ts                # Exportação central
│   │
│   ├── httpClient.ts       # Cliente HTTP configurado (Axios)
│   └── authService.ts      # Serviço de autenticação
```

## Uso dos Serviços

### Exemplo: Listar Cursos

```typescript
import { courseService } from "~/api/services";

// Buscar todos os cursos ativos
const response = await courseService.getActive(0);

if (response.status === "success" && response.data) {
  const courses = response.data.content;
  console.log(courses);
}
```

### Exemplo: Buscar Curso por ID

```typescript
import { courseService } from "~/api/services";

const course = await courseService.getById("curso-id");
if (course) {
  console.log(course.name);
}
```

### Exemplo: Filtrar com Critérios

```typescript
import { courseService } from "~/api/services";

const response = await courseService.list(0, [
  { key: "name", operation: "LIKE", value: "Java" },
  { key: "status", operation: "EQUALS", value: "ACTIVE" },
]);
```

## Tipos Importantes

### JsonResponse

Todas as respostas da API seguem este formato:

```typescript
interface JsonResponse<T> {
  status: "success" | "error";
  message: string;
  data: T | null;
}
```

### PaginatedResponse

Para listagens paginadas:

```typescript
interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}
```

### SearchCriteriaDTO

Para filtros avançados:

```typescript
interface SearchCriteriaDTO {
  key: string;
  operation:
    | "EQUALS"
    | "LIKE"
    | "GREATER_THAN"
    | "LESS_THAN"
    | "GREATER_THAN_OR_EQUAL"
    | "LESS_THAN_OR_EQUAL"
    | "NOT_EQUALS";
  value: string | number | boolean;
}
```

## Autenticação

O sistema usa um interceptor do Axios que automaticamente adiciona os headers necessários:

- `token`: ID da sessão de segurança
- `Authorization`: Bearer token do usuário autenticado

## Endpoints Disponíveis

Veja [API_DOCUMENTATION.md](../../docs/API_DOCUMENTATION.md) para documentação completa dos endpoints.

## Próximos Passos

- [ ] Implementar extração do userId do token JWT
- [ ] Adicionar tratamento de erros global
- [ ] Implementar cache de requisições
- [ ] Adicionar retry logic para requisições falhadas
- [ ] Implementar refresh token automático
