import {
  users,
  questionPapers,
  type User,
  type UpsertUser,
  type InsertQuestionPaper,
  type QuestionPaper,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, ilike, desc, asc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Question paper operations
  createQuestionPaper(paper: InsertQuestionPaper & { uploadedBy: string; filePath: string; fileName: string; fileSize: number }): Promise<QuestionPaper>;
  getQuestionPapers(filters?: {
    course?: string;
    semester?: string;
    academicYear?: string;
    subject?: string;
    limit?: number;
    offset?: number;
  }): Promise<QuestionPaper[]>;
  getQuestionPaperById(id: string): Promise<QuestionPaper | undefined>;
  deleteQuestionPaper(id: string): Promise<void>;
  incrementDownloadCount(id: string): Promise<void>;
  getQuestionPapersCount(filters?: {
    course?: string;
    semester?: string;
    academicYear?: string;
    subject?: string;
  }): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Question paper operations
  async createQuestionPaper(paperData: InsertQuestionPaper & { uploadedBy: string; filePath: string; fileName: string; fileSize: number }): Promise<QuestionPaper> {
    const [paper] = await db
      .insert(questionPapers)
      .values(paperData)
      .returning();
    return paper;
  }

  async getQuestionPapers(filters?: {
    course?: string;
    semester?: string;
    academicYear?: string;
    subject?: string;
    limit?: number;
    offset?: number;
  }): Promise<QuestionPaper[]> {
    let query = db.select().from(questionPapers);

    const conditions = [];
    if (filters?.course) {
      conditions.push(eq(questionPapers.course, filters.course));
    }
    if (filters?.semester) {
      conditions.push(eq(questionPapers.semester, filters.semester));
    }
    if (filters?.academicYear) {
      conditions.push(eq(questionPapers.academicYear, filters.academicYear));
    }
    if (filters?.subject) {
      conditions.push(ilike(questionPapers.subject, `%${filters.subject}%`));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    query = query.orderBy(desc(questionPapers.createdAt));

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    return await query;
  }

  async getQuestionPaperById(id: string): Promise<QuestionPaper | undefined> {
    const [paper] = await db.select().from(questionPapers).where(eq(questionPapers.id, id));
    return paper;
  }

  async deleteQuestionPaper(id: string): Promise<void> {
    await db.delete(questionPapers).where(eq(questionPapers.id, id));
  }

  async incrementDownloadCount(id: string): Promise<void> {
    await db
      .update(questionPapers)
      .set({ downloadCount: sql`${questionPapers.downloadCount} + 1` })
      .where(eq(questionPapers.id, id));
  }

  async getQuestionPapersCount(filters?: {
    course?: string;
    semester?: string;
    academicYear?: string;
    subject?: string;
  }): Promise<number> {
    let query = db.select({ count: sql<number>`count(*)` }).from(questionPapers);

    const conditions = [];
    if (filters?.course) {
      conditions.push(eq(questionPapers.course, filters.course));
    }
    if (filters?.semester) {
      conditions.push(eq(questionPapers.semester, filters.semester));
    }
    if (filters?.academicYear) {
      conditions.push(eq(questionPapers.academicYear, filters.academicYear));
    }
    if (filters?.subject) {
      conditions.push(ilike(questionPapers.subject, `%${filters.subject}%`));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const [{ count }] = await query;
    return count;
  }
}

export const storage = new DatabaseStorage();
