import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertQuestionPaperSchema } from "@shared/schema";
import multer from "multer";
import bcrypt from "bcrypt";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage_multer,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

const hashedAdminPassword = bcrypt.hashSync('password123', 10); // Replace 'password123' with a strong, unique password

// Admin access control middleware - only allow specific email
const isAdmin = async (req: any, res: any, next: any) => {
  try {
    // Check if admin session is set
    if (!req.session || !req.session.isAdmin) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Check if user email matches the admin email
    const adminEmail = "manitejausaa@gmail.com"; // Your admin email    
    
    if (userEmail !== adminEmail) {
      return res.status(403).json({ message: "Access denied. Admin privileges required." });
    }
    
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });

  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Admin login route
  app.post("/api/admin/login", async (req, res) => {
    const { email, password } = req.body;
    const adminEmail = "manitejausaa@gmail.com";
    
    if (email === adminEmail && bcrypt.compareSync(password, hashedAdminPassword)) {
      (req.session as any).isAdmin = true; // Set admin session variable
      res.json({ message: "Admin login successful" });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  });

  // Public routes - Question Papers
  app.get("/api/papers", async (req, res) => {
    try {
      const {
        course,
        semester,
        academicYear,
        subject,
        page = "1",
        limit = "20"
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      const filters = {
        course: course as string,
        semester: semester as string,
        academicYear: academicYear as string,
        subject: subject as string,
        limit: limitNum,
        offset,
      };

      const [papers, total] = await Promise.all([
        storage.getQuestionPapers(filters),
        storage.getQuestionPapersCount({
          course: course as string,
          semester: semester as string,
          academicYear: academicYear as string,
          subject: subject as string,
        }),
      ]);

      res.json({
        papers,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      });
    } catch (error) {
      console.error("Error fetching papers:", error);
      res.status(500).json({ message: "Failed to fetch papers" });
    }
  });

  app.get("/api/papers/:id/download", async (req, res) => {
    try {
      const { id } = req.params;
      const paper = await storage.getQuestionPaperById(id);

      if (!paper) {
        return res.status(404).json({ message: "Paper not found" });
      }

      // Use the file path directly since it's already absolute
      const filePath = paper.filePath;
      
      if (!fs.existsSync(filePath)) {
        console.error("File not found at path:", filePath);
        return res.status(404).json({ message: "File not found" });
      }

      // Increment download count
      await storage.incrementDownloadCount(id);

      res.setHeader("Content-Disposition", `attachment; filename="${paper.fileName}"`);
      res.setHeader("Content-Type", "application/pdf");
      
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error("Error downloading paper:", error);
      res.status(500).json({ message: "Failed to download paper" });
    }
  });

  // Protected admin routes
  app.post("/api/admin/papers", isAdmin, upload.single("file"), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const userId = req.user.claims.sub;
      
      // Create a schema for just the form fields (excluding file fields)
      const formFieldsSchema = insertQuestionPaperSchema.omit({
        fileName: true,
        filePath: true,
        fileSize: true,
        uploadedBy: true,
      });
      
      const paperData = formFieldsSchema.parse(req.body);

      const paper = await storage.createQuestionPaper({
        ...paperData,
        uploadedBy: userId,
        fileName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
      });

      res.status(201).json(paper);
    } catch (error) {
      console.error("Error uploading paper:", error);
      if (req.file) {
        // Clean up uploaded file on error
        fs.unlink(req.file.path, () => {});
      }
      res.status(500).json({ message: "Failed to upload paper" });
    }
  });

  app.get("/api/admin/papers", isAdmin, async (req, res) => {
    try {
      const {
        course,
        semester,
        academicYear,
        subject,
        page = "1",
        limit = "10"
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      const filters = {
        course: course as string,
        semester: semester as string,
        academicYear: academicYear as string,
        subject: subject as string,
        limit: limitNum,
        offset,
      };

      const [papers, total] = await Promise.all([
        storage.getQuestionPapers(filters),
        storage.getQuestionPapersCount({
          course: course as string,
          semester: semester as string,
          academicYear: academicYear as string,
          subject: subject as string,
        }),
      ]);

      res.json({
        papers,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      });
    } catch (error) {
      console.error("Error fetching admin papers:", error);
      res.status(500).json({ message: "Failed to fetch papers" });
    }
  });

  app.delete("/api/admin/papers/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const paper = await storage.getQuestionPaperById(id);

      if (!paper) {
        return res.status(404).json({ message: "Paper not found" });
      }

      // Delete file from filesystem
      const filePath = path.join(process.cwd(), paper.filePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Delete from database
      await storage.deleteQuestionPaper(id);

      res.json({ message: "Paper deleted successfully" });
    } catch (error) {
      console.error("Error deleting paper:", error);
      res.status(500).json({ message: "Failed to delete paper" });
    }
  });

  // Stats endpoint for dashboard
  app.get("/api/admin/stats", isAdmin, async (req, res) => {
    try {
      const [totalPapers] = await Promise.all([
        storage.getQuestionPapersCount(),
      ]);

      // Get this month's uploads
      const currentDate = new Date();
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      
      // For now, return basic stats - can be enhanced with more complex queries
      res.json({
        totalPapers,
        thisMonth: 0, // Would need more complex query
        totalDownloads: 0, // Would need aggregation
        activeCourses: 0, // Would need distinct count
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
