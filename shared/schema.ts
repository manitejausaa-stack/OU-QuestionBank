import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Question papers table
export const questionPapers = pgTable("question_papers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  course: varchar("course").notNull(), // e.g., "btech", "mtech", "bca", etc.
  semester: varchar("semester").notNull(), // e.g., "1", "2", "3", etc.
  academicYear: varchar("academic_year").notNull(), // e.g., "2023-24"
  subject: text("subject").notNull(), // e.g., "Data Structures and Algorithms"
  subjectCode: varchar("subject_code"), // e.g., "CS301" (optional)
  department: text("department").notNull(), // e.g., "Computer Science Engineering"
  fileName: text("file_name").notNull(), // original filename
  filePath: text("file_path").notNull(), // path to stored file
  fileSize: integer("file_size").notNull(), // file size in bytes
  downloadCount: integer("download_count").default(0),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Create insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQuestionPaperSchema = createInsertSchema(questionPapers).omit({
  id: true,
  downloadCount: true,
  uploadedBy: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertQuestionPaper = z.infer<typeof insertQuestionPaperSchema>;
export type QuestionPaper = typeof questionPapers.$inferSelect;
