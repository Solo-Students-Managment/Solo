export type UserRole = 'student' | 'parent' | 'teacher' | 'admin' | 'support';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  username: string;
  password: string;
}

export interface StudentProfile {
  userId: string;
  level: string;
  parentId: string;
  teacherId: string;
  sessionsCompleted: number;
  sessionsRemaining: number;
  attendanceStats: {
    present: number;
    absent: number;
    late: number;
  };
  averageScore: number;
}

export type AttendanceStatus = 'present' | 'absent' | 'late';
export type HomeworkStatus = 'done' | 'not_done';

export interface HomeworkTask {
  id: string;
  title: string;
}

export interface Homework {
  title: string;
  description: string;
  fileUrl?: string;
  tasks: HomeworkTask[];
  status: HomeworkStatus;
  score: number;
  teacherNote: string;
}

export interface Participation {
  participated: boolean;
  score: number;
  teacherNote: string;
}

export interface SpeakingAssessment {
  questions: string[];
  score: number;
  feedback: string;
}

export interface TeacherEvaluation {
  strengths: string[];
  weaknesses: string[];
  nextSessionRecommendation: string;
  teacherNoteScore: number;
}

export interface Session {
  id: string;
  studentId: string;
  teacherId: string;
  date: string;
  topic: string;
  attendanceStatus: AttendanceStatus;
  homework: Homework;
  participation: Participation;
  speaking: SpeakingAssessment;
  teacherEvaluation: TeacherEvaluation;
  finalScore: number;
  parentConfirmed?: boolean;
}

export interface ParentMessage {
  id: string;
  sessionId: string;
  senderId: string;
  senderName: string;
  senderRole: 'parent' | 'teacher';
  message: string;
  reply?: string;
  sentAt: string;
  repliedAt?: string;
}

export interface ChatConversation {
  id: string;
  parentId: string;
  teacherId: string;
  studentId: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: 'parent' | 'teacher';
  body: string;
  sentAt: string;
}

export interface AdminStats {
  averageScore: number;
  homeworkCompletionRate: number;
  attendanceRate: number;
  parentReportViewRate: number;
  activeStudents: number;
  totalTeachers: number;
  totalParents: number;
  totalStudents: number;
  monthlyProgress: { month: string; avgScore: number }[];
  homeworkByMonth: { month: string; rate: number }[];
  attendanceTrend: { month: string; rate: number }[];
  enrollmentTrend: { month: string; count: number }[];
  studentRankings: {
    studentId: string;
    name: string;
    level: string;
    avgScore: number;
    attendanceRate: number;
  }[];
}

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdById: string;
  createdByRole: 'teacher' | 'admin' | 'parent' | 'support';
  assignedToId?: string;
  studentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  authorId: string;
  authorRole: UserRole;
  body: string;
  createdAt: string;
}

export type RevenueStatus = 'paid' | 'pending' | 'overdue';
export type RevenueType = 'tuition' | 'exam' | 'material' | 'other';

export interface RevenueRecord {
  id: string;
  studentId: string;
  parentId: string;
  amount: number;
  type: RevenueType;
  status: RevenueStatus;
  date: string;
  description: string;
}

export interface RevenueSummary {
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  monthlyRevenue: { month: string; paid: number; pending: number }[];
  byType: { type: RevenueType; amount: number }[];
}

export interface AuthSession {
  user: Omit<User, 'password'>;
}

export type ExamQuestionType = 'choice' | 'text';

export interface ChoiceExamQuestion {
  id: string;
  type: 'choice';
  text: string;
  scoreWeight?: number;
  options: [string, string, string, string];
  correctIndex: number;
}

export interface TextExamQuestion {
  id: string;
  type: 'text';
  text: string;
  scoreWeight?: number;
  sampleAnswer?: string;
}

export type ExamQuestion = ChoiceExamQuestion | TextExamQuestion;

export interface ExamAnswers {
  choices: Record<string, number>;
  texts: Record<string, string>;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  teacherId: string;
  questions: ExamQuestion[];
  createdAt: string;
  durationMinutes: number;
}

export type ExamAssignmentStatus = 'assigned' | 'in_progress' | 'completed';

export interface ExamAssignment {
  id: string;
  examId: string;
  studentId: string;
  teacherId: string;
  assignedAt: string;
  status: ExamAssignmentStatus;
  answers: ExamAnswers;
  score: number | null;
  submittedAt: string | null;
}
