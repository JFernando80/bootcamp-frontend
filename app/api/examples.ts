/**
 * Exemplos práticos de uso dos serviços da API
 *
 * Este arquivo contém exemplos de código para as operações mais comuns.
 * Use como referência ao desenvolver novas funcionalidades.
 */

import {
  courseService,
  moduleService,
  activityService,
  userCourseService,
  userModuleService,
  userActivityService,
  userService,
  enumService,
} from "~/api/services";

// ============================================
// EXEMPLOS: CURSOS
// ============================================

/**
 * Listar todos os cursos ativos
 */
export async function exemploListarCursosAtivos() {
  const response = await courseService.getActive(0);

  if (response.status === "success" && response.data) {
    console.log("Cursos:", response.data.content);
    console.log("Total de páginas:", response.data.totalPages);
  }
}

/**
 * Buscar curso específico por ID
 */
export async function exemploBuscarCursoPorId(courseId: string) {
  const course = await courseService.getById(courseId);

  if (course) {
    console.log("Curso encontrado:", course.name);
  } else {
    console.log("Curso não encontrado");
  }
}

/**
 * Buscar cursos por nome
 */
export async function exemploBuscarCursosPorNome(searchTerm: string) {
  const response = await courseService.searchByName(searchTerm, 0);

  if (response.status === "success" && response.data) {
    console.log("Cursos encontrados:", response.data.content.length);
  }
}

/**
 * Criar um novo curso
 */
export async function exemploCriarCurso() {
  const novoCurso = {
    name: "Introdução ao React",
    description: "Aprenda React do zero",
    status: "ACTIVE",
    level: "Iniciante",
    duration: 40,
  };

  const response = await courseService.create(novoCurso);

  if (response.status === "success") {
    console.log("Curso criado:", response.data);
  }
}

// ============================================
// EXEMPLOS: MÓDULOS
// ============================================

/**
 * Buscar módulos de um curso
 */
export async function exemploListarModulosDoCurso(courseId: string) {
  const response = await moduleService.getByCourse(courseId, 0);

  if (response.status === "success" && response.data) {
    const modules = response.data.content;
    console.log(`Curso tem ${modules.length} módulos`);

    modules.forEach((module, index) => {
      console.log(`${index + 1}. ${module.name}`);
    });
  }
}

/**
 * Criar um novo módulo
 */
export async function exemploCriarModulo(courseId: string) {
  const novoModulo = {
    name: "Fundamentos do React",
    description: "Conceitos básicos do React",
    courseId: courseId,
    order: 1,
    duration: 8,
  };

  const response = await moduleService.create(novoModulo);

  if (response.status === "success") {
    console.log("Módulo criado:", response.data);
  }
}

// ============================================
// EXEMPLOS: ATIVIDADES
// ============================================

/**
 * Buscar atividades de um módulo
 */
export async function exemploListarAtividadesDoModulo(moduleId: string) {
  const response = await activityService.getByModule(moduleId, 0);

  if (response.status === "success" && response.data) {
    const activities = response.data.content;
    console.log(`Módulo tem ${activities.length} atividades`);
  }
}

/**
 * Criar uma nova atividade
 */
export async function exemploCriarAtividade(moduleId: string) {
  const novaAtividade = {
    name: "Quiz: Componentes React",
    description: "Teste seus conhecimentos sobre componentes",
    moduleId: moduleId,
    type: "QUIZ",
    order: 1,
    points: 10,
    duration: 15,
  };

  const response = await activityService.create(novaAtividade);

  if (response.status === "success") {
    console.log("Atividade criada:", response.data);
  }
}

// ============================================
// EXEMPLOS: INSCRIÇÕES E PROGRESSO
// ============================================

/**
 * Inscrever usuário em um curso
 */
export async function exemploInscreverNoCurso(
  userId: string,
  courseId: string,
) {
  const response = await userCourseService.enroll(userId, courseId);

  if (response.status === "success") {
    console.log("Usuário inscrito com sucesso!");
  }
}

/**
 * Buscar cursos do usuário
 */
export async function exemploBuscarCursosDoUsuario(userId: string) {
  const response = await userCourseService.getByUser(userId, 0);

  if (response.status === "success" && response.data) {
    const userCourses = response.data.content;

    console.log(`Usuário está inscrito em ${userCourses.length} cursos`);

    userCourses.forEach((uc) => {
      console.log(`- Curso: ${uc.courseId}, Progresso: ${uc.progress}%`);
    });
  }
}

/**
 * Atualizar progresso do usuário em um curso
 */
export async function exemploAtualizarProgressoCurso(
  userCourseId: string,
  progress: number,
) {
  const response = await userCourseService.updateProgress(
    userCourseId,
    progress,
  );

  if (response.status === "success") {
    console.log("Progresso atualizado!");
  }
}

/**
 * Marcar curso como concluído
 */
export async function exemploCompletarCurso(userCourseId: string) {
  const response = await userCourseService.complete(userCourseId);

  if (response.status === "success") {
    console.log("Curso concluído! Certificado disponível.");
  }
}

/**
 * Iniciar um módulo
 */
export async function exemploIniciarModulo(userId: string, moduleId: string) {
  const response = await userModuleService.start(userId, moduleId);

  if (response.status === "success") {
    console.log("Módulo iniciado!");
  }
}

/**
 * Marcar atividade como concluída
 */
export async function exemploCompletarAtividade(
  userActivityId: string,
  score: number,
) {
  const response = await userActivityService.complete(userActivityId, score);

  if (response.status === "success") {
    console.log(`Atividade concluída! Pontuação: ${score}`);
  }
}

/**
 * Buscar atividades concluídas do usuário
 */
export async function exemploBuscarAtividadesConcluidas(userId: string) {
  const response = await userActivityService.getCompletedByUser(userId, 0);

  if (response.status === "success" && response.data) {
    const completed = response.data.content;
    console.log(`Usuário concluiu ${completed.length} atividades`);
  }
}

// ============================================
// EXEMPLOS: USUÁRIOS
// ============================================

/**
 * Buscar usuário por email
 */
export async function exemploBuscarUsuarioPorEmail(email: string) {
  const user = await userService.getByEmail(email);

  if (user) {
    console.log("Usuário encontrado:", user.name);
  } else {
    console.log("Usuário não encontrado");
  }
}

/**
 * Buscar usuários por nome
 */
export async function exemploBuscarUsuariosPorNome(name: string) {
  const response = await userService.searchByName(name, 0);

  if (response.status === "success" && response.data) {
    console.log("Usuários encontrados:", response.data.content.length);
  }
}

// ============================================
// EXEMPLOS: ENUMS
// ============================================

/**
 * Buscar status de curso disponíveis
 */
export async function exemploBuscarStatusCurso() {
  const response = await enumService.getCourseStatuses();

  if (response.status === "success" && response.data) {
    console.log("Status disponíveis:");
    response.data.forEach((status) => {
      console.log(`- ${status.key}: ${status.value}`);
    });
  }
}

// ============================================
// EXEMPLOS: FILTROS AVANÇADOS
// ============================================

/**
 * Buscar cursos com múltiplos filtros
 */
export async function exemploFiltrosAvancados() {
  const response = await courseService.list(0, [
    { key: "status", operation: "EQUAL", value: "ACTIVE" },
    { key: "level", operation: "EQUAL", value: "Iniciante" },
    { key: "name", operation: "MATCH", value: "React" },
  ]);

  if (response.statusCode === 200 && response.body) {
    console.log("Cursos filtrados:", response.body.lista);
  }
}

/**
 * Buscar cursos por intervalo de duração
 */
export async function exemploBuscarCursosPorDuracao(
  minHoras: number,
  maxHoras: number,
) {
  const response = await courseService.list(0, [
    { key: "duration", operation: "GREATER_THAN_EQUAL", value: minHoras },
    { key: "duration", operation: "LESS_THAN_EQUAL", value: maxHoras },
  ]);

  if (response.statusCode === 200 && response.body) {
    console.log(
      `Cursos entre ${minHoras} e ${maxHoras} horas:`,
      response.body.lista.length,
    );
  }
}

// ============================================
// EXEMPLOS: PAGINAÇÃO
// ============================================

/**
 * Navegar entre páginas de resultados
 */
export async function exemploNavegacaoPaginada() {
  let page = 0;
  let hasNextPage = true;

  while (hasNextPage) {
    const response = await courseService.getActive(page);

    if (response.status === "success" && response.data) {
      const { content, totalPages, number } = response.data;

      console.log(`Página ${number + 1} de ${totalPages}`);
      console.log(`Cursos nesta página: ${content.length}`);

      // Processar cursos...

      hasNextPage = !response.data.last;
      page++;
    } else {
      hasNextPage = false;
    }
  }
}

// ============================================
// EXEMPLOS: TRATAMENTO DE ERROS
// ============================================

/**
 * Exemplo com tratamento de erro completo
 */
export async function exemploComTratamentoDeErro(courseId: string) {
  try {
    const course = await courseService.getById(courseId);

    if (!course) {
      console.log("Curso não encontrado");
      return null;
    }

    console.log("Curso carregado:", course.name);
    return course;
  } catch (error: any) {
    console.error("Erro ao buscar curso:", error);

    if (error.response) {
      // Erro da API
      console.log("Status:", error.response.status);
      console.log("Mensagem:", error.response.data?.message);
    } else if (error.request) {
      // Sem resposta do servidor
      console.log("Servidor não respondeu");
    } else {
      // Erro na configuração da requisição
      console.log("Erro:", error.message);
    }

    return null;
  }
}

/**
 * Exemplo de operação com retry
 */
export async function exemploComRetry(courseId: string, maxRetries = 3) {
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      const course = await courseService.getById(courseId);
      return course;
    } catch (error) {
      attempts++;

      if (attempts >= maxRetries) {
        console.error("Falhou após", maxRetries, "tentativas");
        throw error;
      }

      console.log(`Tentativa ${attempts} falhou, tentando novamente...`);
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
    }
  }
}
