export type UserRole = 'ADMIN' | 'TEACHER' | 'PARENT' | 'STUDENT' | 'SCHOOL';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  avatar: string | null;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // Profils spécifiques par rôle
  teacherProfile?: {
    id: string;
    bio?: string;
    subjects?: string[];
    experience?: number;
    pricePerMonth?: number;
    pricePerHour?: number;
    levels?: string[];
    certifications?: string[];
    validationStatus?: string;
    isPremium?: boolean;
    rating?: number;
    reviewCount?: number;
    totalStudents?: number;
    points?: number;
    specialty?: string;
    totalEarnings?: number;
  };

  parentProfile?: {
    id: string;
  };

  studentProfile?: {
    id: string;
  };

  schoolProfile?: {
    id: string;
    schoolName?: string;
    hasSubscription?: boolean;
  };
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
}
