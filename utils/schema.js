import { pgTable, serial, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
        id: serial("id").primaryKey().notNull(),
        email: varchar("email", { length: 255 }).notNull().unique(),
        password: varchar("password", { length: 255 }).notNull(),
        createdAt: timestamp("createdAt", { mode: 'string' }).defaultNow(),     
});


export const interview_sessions = pgTable("interview_sessions", {
  id: serial("id").primaryKey().notNull(),
  mockId: varchar("mockid", { length: 255 }).notNull().unique(), // Retained for backwards compatibility
  jobPosition: varchar("jobposition", { length: 1000 }).notNull(),        
  jobDescription: varchar("jobdescription", { length: 1000 }).notNull(),  
  jobExperience: varchar("jobexp", { length: 255 }).notNull(),
  generatedQuestions: text("jsonmockresp").notNull(), // JSON array of questions
  createdBy: varchar("createdby", { length: 255 }).notNull(),
  createdAt: timestamp("createdat", { mode: 'string' }).defaultNow(),
  aiSummary: text("aiSummary"),
  overallScore: integer("overallScore"),
  cameraEnabled: boolean("cameraEnabled").default(false),
  sessionDurationSec: integer("sessionDurationSec"),
});

export const interview_answers = pgTable("interview_answers", {
  id: serial("id").primaryKey().notNull(),
  sessionId: varchar('sessionId').notNull().references(() => interview_sessions.mockId),
  question: varchar('question').notNull(),
  correctAnswer: text('correctanswer'),
  userAnswer: text('useranswer'),
  transcript: text('transcript'), // Exact words spoken by user
  feedback: text('feedback'),
  rating: integer('rating'),
  userEmail: varchar('userEmail'),
  createdAt: timestamp("createdat", { mode: 'string' }).defaultNow(),
});

export const session_metrics = pgTable("session_metrics", {
  id: serial("id").primaryKey().notNull(),
  sessionId: varchar('sessionId').notNull().references(() => interview_sessions.mockId),
  eyeContactScore: integer("eyeContactScore"),
  handGestureCount: integer("handGestureCount"),
  badPostureCount: integer("badPostureCount"),
});

export const cv_uploads = pgTable("cv_uploads", {
  id: serial("id").primaryKey().notNull(),
  userEmail: varchar("userEmail", { length: 255 }).notNull(),
  cvText: text("cvText").notNull(),
  extractedSkills: text("extractedSkills"), 
  extractedProjects: text("extractedProjects"), 
  targetRoles: text("targetRoles"), 
  createdAt: timestamp("createdAt", { mode: 'string' }).defaultNow(),
});

export const preparation_planner = pgTable("preparation_planner", {
  id: serial("id").primaryKey().notNull(),
  userEmail: varchar("userEmail", { length: 255 }).notNull(),
  plannerJson: text("plannerJson"),
  readinessBaseline: integer("readinessBaseline"),
  active: boolean("active").default(true),
  createdAt: timestamp("createdAt", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: 'string' }).defaultNow(),
});

export const improvement_roadmap = pgTable("improvement_roadmap", {
  id: serial("id").primaryKey().notNull(),
  userEmail: varchar("userEmail", { length: 255 }).notNull(),
  topic: varchar("topic", { length: 255 }).notNull(),
  category: varchar("category", { length: 255 }),
  description: text("description"),
  priority: varchar("priority", { length: 50 }),
  companyTag: varchar("companyTag", { length: 255 }),
  sourceInterviewId: varchar("sourceInterviewId", { length: 255 }),
  status: varchar("status", { length: 50 }).default('active'),
  lastSeenScore: integer("lastSeenScore"),
  createdAt: timestamp("createdAt", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: 'string' }).defaultNow(),
});

export const target_companies = pgTable("target_companies", {
  id: serial("id").primaryKey().notNull(),
  userEmail: varchar("userEmail", { length: 255 }).notNull(),
  companyName: varchar("companyName", { length: 255 }).notNull(),
  roleName: varchar("roleName", { length: 255 }),
  priorityLevel: varchar("priorityLevel", { length: 50 }),
  active: boolean("active").default(true),
  createdAt: timestamp("createdAt", { mode: 'string' }).defaultNow(),
});
