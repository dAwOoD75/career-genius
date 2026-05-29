// ========================
// Auth & User Types
// ========================
export interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  bio?: string;
  location?: string;
  phone?: string;
  linkedin_url?: string;
  github_url?: string;
  website_url?: string;
  avatar_url?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  last_login?: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  full_name?: string;
  password: string;
}

// ========================
// Resume Types
// ========================
export interface ExperienceItem {
  company: string;
  position: string;
  start_date: string;
  end_date?: string;
  location?: string;
  description?: string;
  achievements?: string[];
}

export interface EducationItem {
  institution: string;
  degree: string;
  field_of_study?: string;
  start_date: string;
  end_date?: string;
  gpa?: string;
  achievements?: string[];
}

export interface ProjectItem {
  name: string;
  description?: string;
  technologies?: string[];
  url?: string;
  github_url?: string;
  start_date?: string;
  end_date?: string;
}

export interface CertificationItem {
  name: string;
  issuer: string;
  date?: string;
  expiry?: string;
  credential_url?: string;
}

export interface LanguageItem {
  language: string;
  proficiency: string;
}

export interface Resume {
  id: number;
  user_id: number;
  title: string;
  template: string;
  full_name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  summary?: string;
  ai_summary?: string;
  experience?: ExperienceItem[];
  education?: EducationItem[];
  skills?: string[];
  certifications?: CertificationItem[];
  projects?: ProjectItem[];
  languages?: LanguageItem[];
  awards?: any[];
  created_at: string;
  updated_at?: string;
}

// ========================
// ATS Report Types
// ========================
export interface SectionAnalysis {
  has_contact: boolean;
  has_summary: boolean;
  has_experience: boolean;
  has_education: boolean;
  has_skills: boolean;
  has_certifications: boolean;
  completeness_percentage: number;
}

export interface ATSReport {
  id: number;
  user_id: number;
  original_filename?: string;
  job_description?: string;
  overall_score: number;
  keyword_score: number;
  format_score: number;
  readability_score: number;
  completeness_score: number;
  matched_keywords: string[];
  missing_keywords: string[];
  skill_gaps: string[];
  formatting_issues: string[];
  improvement_suggestions: string[];
  extracted_skills: string[];
  section_analysis: SectionAnalysis;
  created_at: string;
}

// ========================
// Cover Letter Types
// ========================
export interface CoverLetter {
  id: number;
  user_id: number;
  title: string;
  company_name?: string;
  job_title?: string;
  job_description?: string;
  applicant_name?: string;
  tone: string;
  content: string;
  created_at: string;
  updated_at?: string;
}

// ========================
// Interview Types
// ========================
export interface ChatMessage {
  id: number;
  session_id: number;
  role: 'user' | 'assistant';
  content: string;
  feedback?: string;
  score?: number;
  question_type?: string;
  created_at: string;
}

export interface ChatSession {
  id: number;
  user_id: number;
  title: string;
  interview_type: string;
  difficulty: string;
  job_role?: string;
  technology_stack?: string;
  total_questions: number;
  session_feedback?: string;
  overall_score?: number;
  messages?: ChatMessage[];
  created_at: string;
  updated_at?: string;
  ended_at?: string;
}

// ========================
// Salary Types
// ========================
export interface SalaryPrediction {
  id: number;
  user_id: number;
  job_title: string;
  experience_years: number;
  country: string;
  city?: string;
  education_level?: string;
  skills: string[];
  industry?: string;
  company_size?: string;
  predicted_min?: number;
  predicted_max?: number;
  predicted_median?: number;
  currency: string;
  market_insights?: string;
  skill_impact: Record<string, number>;
  comparable_roles: Array<{ title: string; salary_min: number; salary_max: number }>;
  growth_projection: { year_1?: number; year_3?: number; year_5?: number };
  created_at: string;
}

// ========================
// Dashboard Types
// ========================
export interface DashboardStats {
  total_resumes: number;
  total_ats_reports: number;
  total_cover_letters: number;
  total_interview_sessions: number;
  total_salary_predictions: number;
  avg_ats_score: number;
  recent_activities: Array<{
    action: string;
    module: string;
    description: string;
    created_at: string;
  }>;
  recent_resumes: Array<{ id: number; title: string; template: string; created_at: string }>;
  recent_ats_reports: Array<{ id: number; filename: string; overall_score: number; created_at: string }>;
}

// ========================
// API Error
// ========================
export interface ApiError {
  detail: string;
  errors?: Array<{ field: string; message: string }>;
}
