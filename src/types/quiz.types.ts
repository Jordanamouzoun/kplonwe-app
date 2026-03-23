export type QuestionType = 'MULTIPLE_CHOICE' | 'SINGLE_CHOICE' | 'FREE_TEXT';
export type PointsType = 'STANDARD' | 'DOUBLE' | 'NONE';

export interface QuizQuestion {
  id: string;
  question: string;
  type: QuestionType;
  coverImage?: string;
  options?: string[]; // Sauf pour FREE_TEXT
  correctAnswer: string; // Index ou texte
  points: number;
  pointsType: PointsType;
  duration?: number; // secondes
  order: number;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  subject: string;
  coverImage?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  questions: QuizQuestion[];
  duration?: number; // Total (optionnel)
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  
  _count?: {
    questions: number;
    results: number;
    assignments: number;
  };
}

export interface QuizAssignment {
  id: string;
  quizId: string;
  studentId: string;
  dueDate?: string;
  assignedAt: string;
}

export interface QuizResult {
  id: string;
  quizId: string;
  studentId: string;
  score: number;
  answers: string; // JSON
  timeSpent: number;
  startedAt: string;
  completedAt: string;
  student?: {
    user: {
      firstName: string;
      lastName: string;
      avatar?: string;
    };
  };
}
