# Guia de Migração: De Mocks para API Real

Este guia explica como migrar componentes que usavam dados mockados para usar a API real.

## Antes (com Mocks)

```tsx
import { mockCourses } from "~/data/mockCourses";

function MeuComponente() {
  const courses = mockCourses;

  return (
    <div>
      {courses.map((course) => (
        <div key={course.id}>{course.title}</div>
      ))}
    </div>
  );
}
```

## Depois (com API)

```tsx
import { useState, useEffect } from "react";
import { courseService } from "~/api/services";
import type { CourseDTO } from "~/api/types";

function MeuComponente() {
  const [courses, setCourses] = useState<CourseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCourses() {
      try {
        setLoading(true);
        const response = await courseService.getActive(0);

        if (response.status === "success" && response.data) {
          setCourses(response.data.content);
        }
      } catch (err) {
        console.error("Erro ao carregar cursos:", err);
        setError("Não foi possível carregar os cursos");
      } finally {
        setLoading(false);
      }
    }

    loadCourses();
  }, []);

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div>
      {courses.map((course) => (
        <div key={course.id}>{course.name}</div>
      ))}
    </div>
  );
}
```

## Principais Diferenças

### 1. Campos Diferentes

- Mock: `course.title`
- API: `course.name`

### 2. IDs

- Mock: `number` (1, 2, 3...)
- API: `string` (UUID)

### 3. Dados Assíncronos

A API requer:

- Estados de `loading`
- Tratamento de `error`
- `useEffect` para carregar dados
- `async/await` para requisições

## Padrões Comuns

### Buscar Curso por ID

```tsx
const [course, setCourse] = useState<CourseDTO | null>(null);

useEffect(() => {
  async function loadCourse() {
    if (!courseId) return;

    const courseData = await courseService.getById(courseId);
    setCourse(courseData);
  }

  loadCourse();
}, [courseId]);
```

### Buscar Cursos do Usuário

```tsx
const [userCourses, setUserCourses] = useState<UserCourseDTO[]>([]);

useEffect(() => {
  async function loadUserCourses() {
    // TODO: Obter userId do contexto de autenticação
    const userId = "user-id-aqui";

    const response = await userCourseService.getByUser(userId, 0);

    if (response.status === "success" && response.data) {
      setUserCourses(response.data.content);
    }
  }

  loadUserCourses();
}, []);
```

### Inscrever Usuário em Curso

```tsx
async function enrollInCourse(courseId: string) {
  try {
    // TODO: Obter userId do contexto de autenticação
    const userId = "user-id-aqui";

    await userCourseService.enroll(userId, courseId);

    // Sucesso - redirecionar ou atualizar UI
    navigate(`/courses/${courseId}`);
  } catch (error) {
    console.error("Erro ao inscrever no curso:", error);
    alert("Não foi possível inscrever no curso");
  }
}
```

### Buscar Módulos de um Curso

```tsx
const [modules, setModules] = useState<ModuleDTO[]>([]);

useEffect(() => {
  async function loadModules() {
    if (!courseId) return;

    const response = await moduleService.getByCourse(courseId, 0);

    if (response.status === "success" && response.data) {
      setModules(response.data.content);
    }
  }

  loadModules();
}, [courseId]);
```

### Filtrar Cursos

```tsx
async function searchCourses(searchTerm: string) {
  const response = await courseService.searchByName(searchTerm, 0);

  if (response.status === "success" && response.data) {
    return response.data.content;
  }

  return [];
}
```

## Tratamento de Erros

Sempre envolva chamadas de API em try-catch:

```tsx
try {
  const response = await courseService.getActive(0);
  // processar resposta
} catch (error) {
  console.error("Erro:", error);
  setError("Mensagem amigável para o usuário");
}
```

## Paginação

A maioria dos endpoints suporta paginação:

```tsx
const [page, setPage] = useState(0);
const [courses, setCourses] = useState<CourseDTO[]>([]);
const [totalPages, setTotalPages] = useState(0);

async function loadPage(pageNumber: number) {
  const response = await courseService.getActive(pageNumber);

  if (response.status === "success" && response.data) {
    setCourses(response.data.content);
    setTotalPages(response.data.totalPages);
  }
}

// Carregar próxima página
function nextPage() {
  if (page < totalPages - 1) {
    const nextPage = page + 1;
    setPage(nextPage);
    loadPage(nextPage);
  }
}
```

## Campos Não Disponíveis na API

Alguns campos do mock não existem na API:

- `icon` → Use um ícone padrão (BookOpen)
- `organization` → Use "Bootcamp" como padrão
- `rating`, `reviews`, `students` → Não disponíveis
- `instructor`, `whatYouLearn`, `requirements` → Não disponíveis

Adapte a UI para mostrar apenas dados disponíveis ou use valores padrão razoáveis.

## Autenticação

Algumas operações requerem autenticação. O interceptor do httpClient adiciona automaticamente os headers necessários se o usuário estiver logado.

```tsx
import { useAuth } from "~/context/AuthProvider";

function MeuComponente() {
  const { isAuthenticated } = useAuth();

  async function doSomething() {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Operação protegida
    await someApiCall();
  }
}
```

## Próximos Passos

1. Implementar hook `useUser()` para obter ID do usuário logado
2. Adicionar cache de dados para melhorar performance
3. Implementar loading states globais
4. Adicionar refresh automático de dados
