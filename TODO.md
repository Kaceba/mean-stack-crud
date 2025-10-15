# Backend Production Readiness TODO

## 🔴 Critical (Must Fix Before Production)

### 1. Input Validation
**File**: `backend/app.ts:22-29`
**Problem**: No validation on user input - security vulnerability
**Fix**: Implement express-validator or Joi
```bash
npm install express-validator
```
```typescript
import { body, validationResult } from 'express-validator';

app.post('/api/posts', [
    body('title').isString().trim().isLength({ min: 3, max: 100 }),
    body('content').isString().trim().isLength({ min: 1, max: 5000 })
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    // Process validated data
});
```

### 2. CORS Configuration
**File**: `backend/app.ts:16`
**Problem**: `Access-Control-Allow-Origin: *` allows ANY domain
**Fix**: Whitelist specific origins
```typescript
const allowedOrigins = ['http://localhost:4200', 'https://yourdomain.com'];
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    next();
});
```

### 3. Global Error Handling
**File**: `backend/app.ts` (missing)
**Problem**: Unhandled errors crash the server
**Fix**: Add error handling middleware at the end of app.ts
```typescript
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    const statusCode = (err as any).statusCode || 500;
    res.status(statusCode).json({
        error: process.env['NODE_ENV'] === 'production'
            ? 'Internal server error'
            : err.message
    });
});
```

### 4. Replace Deprecated body-parser
**File**: `backend/app.ts:2, 12-13`
**Problem**: body-parser is deprecated (built into Express now)
**Fix**:
```typescript
// Remove: import bodyParser from "body-parser";
// Remove: app.use(bodyParser.json());
// Remove: app.use(bodyParser.urlencoded({ extended: false }));

// Add:
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
```

### 5. Proper Logging
**File**: `backend/app.ts:24`
**Problem**: Using console.log in production
**Fix**: Implement Winston or Pino
```bash
npm install winston
```
```typescript
import winston from 'winston';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

if (process.env['NODE_ENV'] !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

// Usage:
logger.info('Post created', { post });
```

---

## ⚠️ High Priority (Security & Scalability)

### 6. Rate Limiting
**File**: `backend/app.ts` (missing)
**Problem**: Vulnerable to DDoS attacks
**Fix**: Add rate limiter
```bash
npm install express-rate-limit
```
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP'
});

app.use('/api/', limiter);
```

### 7. Security Headers (Helmet)
**File**: `backend/app.ts` (missing)
**Problem**: Missing security best practices headers
**Fix**: Add Helmet
```bash
npm install helmet
```
```typescript
import helmet from 'helmet';
app.use(helmet());
```

### 8. Environment Configuration
**File**: `backend/app.ts`, `server.ts`
**Problem**: No centralized config management
**Fix**: Create config system
```bash
npm install dotenv
```
```typescript
// config/index.ts
import dotenv from 'dotenv';
dotenv.config();

export const config = {
    port: process.env['PORT'] || 3000,
    nodeEnv: process.env['NODE_ENV'] || 'development',
    dbUrl: process.env['DB_URL'],
    corsOrigins: process.env['CORS_ORIGINS']?.split(',') || ['http://localhost:4200']
};
```

Create `.env` file (add to .gitignore):
```
PORT=3000
NODE_ENV=development
DB_URL=mongodb://localhost:27017/mydb
CORS_ORIGINS=http://localhost:4200,https://yourdomain.com
```

---

## 📋 Medium Priority (Code Organization)

### 9. Separate Routes
**File**: `backend/app.ts` (refactor needed)
**Problem**: All routes in one file → unmaintainable
**Fix**: Create router structure
```
backend/
├── routes/
│   └── posts.ts
├── controllers/
│   └── posts.controller.ts
├── models/
│   └── post.model.ts
├── middleware/
│   └── validation.ts
└── app.ts
```

```typescript
// routes/posts.ts
import { Router } from 'express';
import * as postsController from '../controllers/posts.controller';

const router = Router();
router.get('/', postsController.getPosts);
router.post('/', postsController.createPost);

export default router;

// app.ts
import postsRouter from './routes/posts';
app.use('/api/posts', postsRouter);
```

### 10. API Versioning
**File**: `backend/app.ts`
**Problem**: No API versioning → breaking changes affect all clients
**Fix**: Version your API
```typescript
app.use('/api/v1/posts', postsRouter);
```

### 11. Remove Unused Parameters
**File**: `backend/app.ts:22, 32`
**Problem**: Unused `next` parameter in route handlers
**Fix**: Remove or prefix with underscore
```typescript
// If not using next, remove it:
app.post('/api/posts', (req: Request, res: Response) => {
    // ...
});

// Or if keeping for consistency, prefix:
app.post('/api/posts', (req: Request, res: Response, _next: NextFunction) => {
    // ...
});
```

### 12. Create Proper TypeScript Types/Interfaces
**File**: `backend/app.ts:4-8`
**Problem**: Interface defined in app.ts should be in separate models file
**Fix**: Create models directory
```typescript
// models/post.model.ts
export interface Post {
    id: string | null;
    title: string;
    content: string;
}

// app.ts
import { Post } from './models/post.model';
```

---

## 🔧 Low Priority (Nice to Have)

### 13. HTTP Request Logging
**File**: `backend/app.ts` (missing)
**Fix**: Add Morgan for HTTP logging
```bash
npm install morgan @types/morgan
```
```typescript
import morgan from 'morgan';
app.use(morgan('combined'));
```

### 14. Compression
**File**: `backend/app.ts` (missing)
**Fix**: Add response compression
```bash
npm install compression @types/compression
```
```typescript
import compression from 'compression';
app.use(compression());
```

### 15. Graceful Shutdown
**File**: `server.ts` (missing)
**Fix**: Handle process termination properly
```typescript
process.on('SIGTERM', () => {
    debugLog('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        debugLog('HTTP server closed');
        // Close database connections, etc.
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    debugLog('SIGINT signal received: closing HTTP server');
    server.close(() => {
        debugLog('HTTP server closed');
        process.exit(0);
    });
});
```

### 16. Health Check Endpoint
**File**: `backend/app.ts` (missing)
**Fix**: Add health check for monitoring
```typescript
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
```

---

## 📝 Notes

- Items 1-5 are **critical** and must be addressed before any production deployment
- Items 6-8 are **high priority** for security and should be added soon
- Items 9-12 are **medium priority** for maintainability
- Items 13-16 are **nice to have** improvements

## Progress Tracking

- [ ] Critical items completed (0/5)
- [ ] High priority items completed (0/3)
- [ ] Medium priority items completed (0/4)
- [ ] Low priority items completed (0/4)
