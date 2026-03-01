// Tipos relacionados a cursos, módulos e atividades

export interface CourseDTO {
  id?: string;
  slug?: string;
  title: string; // min: 10, max: 100
  description: string; // min: 10, max: 300
  publishedAtS?: string;
  createdAtS?: string;
  updatedAtS?: string;
  ownerUser?: {
    id?: string;
    name?: string;
    email?: string;
  };
}

export interface ModuleDTO {
  id?: string;
  index: number; // Ordem do módulo no curso
  title: string; // Nome do módulo
  description: string;
  requiredToCompleteCourse: boolean; // Se é obrigatório para completar o curso
  createdAtS?: string; // Data de criação (formato string)
  updatedAtS?: string; // Data de atualização (formato string)
  courseId: string;
  courseDescription?: string; // Descrição do curso associado
}

export interface ActivityDTO {
  id?: string;
  type: string; // Tipo da atividade
  configJson: string; // Configuração em JSON
  maxScore: number; // Pontuação máxima
  passingScore: number; // Pontuação mínima para passar
  createdAtS?: string; // Data de criação (formato string)
  updatedAtS?: string; // Data de atualização (formato string)
  moduleId?: string;
  moduleDescription?: string; // Descrição do módulo associado
}

export interface UserCourseDTO {
  id?: string;
  userId: string;
  userName?: string;
  courseId: string;
  courseDescription?: string;
  progressPercent?: number;
  status?: string;
  enrolledAt?: string;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  certificateToken?: string;
}

export interface UserModuleDTO {
  id?: string;
  userId: string;
  userName?: string;
  moduleId: string;
  moduleDescription?: string;
  status?: string;
  progressPercent?: number;
  startedAt?: string;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserActivityDTO {
  id?: string;
  userId: string;
  userName?: string;
  activityId: string;
  activityType?: string;
  moduleId?: string;
  moduleDescription?: string;
  status?: string;
  score?: number;
  attemptNumber?: number | null;
  answerJson?: string | null;
  submittedAtS?: string | null;
  startedAt?: string;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}
