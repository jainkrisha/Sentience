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
