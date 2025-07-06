import express, { Application, NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import bodyParser from "body-parser";
import router from "./app/routes";
import GlobalErrorHandler from "./app/middlewares/globalErrorHandler";
import { AppBodyTemplate } from "./utils/BodyTemplate";

const app: Application = express();

export const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:3001",
    "https://blutournments.vercel.app",
    "https://react-blu-primely.vercel.app"
    
  ],

  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// Middleware setup
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Route handler for the root endpoint
app.get("/", (req: Request, res: Response) => {
  res.send(
    AppBodyTemplate({
      message: "Welcome to Note Organizer Project API 🚀",
      version: "1.0.1",
      status: "Active",
      repoUrl: "https://github.com/yourusername/note-organizer",
      docsUrl: "https://github.com/yourusername/note-organizer#readme",
      showButtons: false,
    })
  );
});
// In your server.ts
// app.get("/", (req: Request, res: Response) => {
//   res.status(503).send(AppBodyTemplate({
//     message: "🚧 Scheduled Maintenance 🚧",
//     version: "1.0.1",
//     status: "Maintenance",
//     showButtons: false,
//     customStyles: `
//       .container {
//         background-color: #fff8e6;
//         border-left: 5px solid #ff9800;
//       }
//       h1 {
//         color: #ff9800;
//       }
//       .status {
//         background-color: #ffebc2;
//         color: #e65100;
//       }
//     `,
//     additionalContent: `
//       <div class="maintenance-info">
//         <p>We're currently performing scheduled maintenance. Expected downtime:</p>
//         <p><strong>July 7, 2025 - 02:00 to 04:00 UTC</strong></p>
//         <p>Sorry for the inconvenience. Please check back later.</p>
//       </div>
//     `
//   }));
// });

// app.use("/uploads", express.static(path.join("/var/www/uploads")));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'))); // Serve static files from the "uploads" directory

// Setup API routes
app.use("/api/v1", router);

// Error handling middleware
app.use(GlobalErrorHandler);

// 404 Not Found handler
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "API NOT FOUND!",
    error: {
      path: req.originalUrl,
      message: "Your requested path is not found!",
    },
  });
});

export default app;
