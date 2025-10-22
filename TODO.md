# MEAN Stack Production Readiness TODO

## Critical (Security & Must Fix Before Production)

### 1. CORS Wide Open - Security Risk
**Files**: `backend/app.ts:11`
**Problem**: `Access-Control-Allow-Origin: *` allows ANY domain to access your API
**Impact**: Anyone can make requests from any website
**Fix**: Whitelist specific origins
```bash
npm install cors
```
```typescript
import cors from 'cors';

const allowedOrigins = [
  'http://localhost:4200',
  'https://yourdomain.com'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

### 2. No Input Validation on Backend
**Files**: `backend/app.ts:17-42, 66-99, 101-121`
**Problem**: Directly using `req.body` without validation/sanitization
**Impact**: SQL injection, XSS, malformed data crashes
**Fix**: Add express-validator
```bash
npm install express-validator
```
```typescript
import { body, validationResult, param } from 'express-validator';

// POST validation
const postValidation = [
  body('title').trim().isLength({ min: 3, max: 100 }).escape(),
  body('content').trim().isLength({ min: 1, max: 5000 }).escape()
];

// PUT validation
const updateValidation = [
  param('id').isMongoId(),
  ...postValidation
];

app.post('/api/posts', postValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // Process validated data
});
```

### 3. No User Error Feedback in Frontend
**Files**: `src/app/posts/posts.service.ts:59`, all HTTP calls
**Problem**: Errors only logged to console, users see nothing when operations fail
**Impact**: Poor UX, users don't know what went wrong
**Fix**: Add Angular Material Snackbar for notifications
```bash
npm install @angular/material
```
```typescript
import { MatSnackBar } from '@angular/material/snack-bar';

constructor(
  private http: HttpClient,
  private snackBar: MatSnackBar
) {}

updatePost(id: string, title: string, content: string): void {
  this.http.put<{ message: string; post: Post }>(`.../${id}`, post)
    .subscribe({
      next: (responseData) => {
        this.snackBar.open('Post updated successfully', 'Close', { duration: 3000 });
        // Update local state
      },
      error: (error) => {
        this.snackBar.open('Failed to update post. Please try again.', 'Close', { duration: 5000 });
        console.error('Update error:', error);
      }
    });
}
```

### 4. Security Headers Missing
**Files**: `backend/app.ts` (missing)
**Problem**: No security headers to prevent common attacks
**Impact**: Vulnerable to XSS, clickjacking, MIME sniffing attacks
**Fix**: Add Helmet
```bash
npm install helmet
```
```typescript
import helmet from 'helmet';
app.use(helmet());
```

### 5. Rate Limiting Missing
**Files**: `backend/app.ts` (missing)
**Problem**: No protection against DDoS or brute force attacks
**Impact**: Server can be overwhelmed with requests
**Fix**: Add rate limiter
```bash
npm install express-rate-limit
```
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  message: 'Too many requests from this IP, please try again later'
});

app.use('/api/', limiter);
```

---

## High Priority (Architecture & Code Quality)

### 6. Manual State Management Anti-pattern (Frontend)
**Files**: `src/app/posts/posts.service.ts:10-11, 18-20, 38-40, 51-56, 69-71`
**Problem**: Manually maintaining local `posts` array and using Subject for notifications
**Impact**: Error-prone, causes data duplication, hard to debug
**Fix**: Use observables directly, don't store state in service
```typescript
// Before (bad):
private posts: Post[] = [];
getPosts(): void {
  this.http.get(...).subscribe(data => {
    this.posts = data.posts;
    this.postsUpdated.next([...this.posts]);
  });
}

// After (good):
getPosts(): Observable<Post[]> {
  return this.http.get<{ posts: Post[] }>(...)
    .pipe(map(response => response.posts));
}

// Components subscribe directly:
this.postsService.getPosts().subscribe(posts => this.posts = posts);
```

### 7. Edit Flow Using Parent/Child Anti-pattern (Frontend)
**Files**: `src/app/app.ts:14-18`, `src/app/posts/post-create/post-create.ts:16, 33-44, 58-66`
**Problem**: Passing post data up to parent then back down, manual mode management
**Impact**: Complex, brittle, doesn't work with browser back button
**Fix**: Use Angular Router with route parameters
```typescript
// app.routes.ts
export const routes: Routes = [
  { path: 'posts/create', component: PostCreate },
  { path: 'posts/edit/:id', component: PostCreate }
];

// post-list.ts
onEdit(post: Post) {
  this.router.navigate(['/posts/edit', post.id]);
}

// post-create.ts
ngOnInit() {
  this.route.params.subscribe(params => {
    if (params['id']) {
      this.mode = 'edit';
      this.postsService.getPost(params['id']).subscribe(post => {
        this.postForm.patchValue(post);
      });
    }
  });
}
```

### 8. Hardcoded API URLs
**Files**: `src/app/posts/posts.service.ts:17, 35, 47, 66`
**Problem**: `http://localhost:3000` hardcoded in every HTTP call
**Impact**: Can't switch environments without code changes
**Fix**: Use Angular environment files
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};

// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.yourdomain.com/api'
};

// posts.service.ts
import { environment } from '../../environments/environment';

getPosts(): Observable<Post[]> {
  return this.http.get<{ posts: Post[] }>(`${environment.apiUrl}/posts`)
    .pipe(map(response => response.posts));
}
```

### 9. Missing Error Handling for findIndex
**Files**: `src/app/posts/posts.service.ts:52`
**Problem**: If `findIndex` returns -1 (not found), `updatedPosts[-1] = ...` fails silently
**Impact**: Bugs and data corruption
**Fix**: Check if index exists
```typescript
const oldPostIndex = updatedPosts.findIndex(p => p.id === id);
if (oldPostIndex === -1) {
  console.error('Post not found in local array');
  // Re-fetch all posts or show error
  this.getPosts();
  return;
}
updatedPosts[oldPostIndex] = responseData.post;
```

### 10. No Loading States
**Files**: All components making HTTP requests
**Problem**: No spinners or indicators during async operations
**Impact**: Poor UX, users don't know if app is working
**Fix**: Add loading flags
```typescript
export class PostList {
  posts: Post[] = [];
  isLoading = false;

  ngOnInit() {
    this.isLoading = true;
    this.postsService.getPosts().subscribe({
      next: (posts) => {
        this.posts = posts;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}

// Template
@if (isLoading) {
  <mat-spinner></mat-spinner>
} @else {
  <!-- content -->
}
```

---

## Medium Priority (Code Organization & Maintainability)

### 11. Separate Routes into Modules
**Files**: `backend/app.ts` (all routes in one file)
**Problem**: All routes in one file becomes unmaintainable as app grows
**Fix**: Create proper structure
```
backend/
├── routes/
│   └── posts.routes.ts
├── controllers/
│   └── posts.controller.ts
├── models/
│   └── post.model.ts
├── middleware/
│   └── validation.ts
└── app.ts
```

```typescript
// routes/posts.routes.ts
import { Router } from 'express';
import * as postsController from '../controllers/posts.controller';
import { postValidation } from '../middleware/validation';

const router = Router();
router.get('/', postsController.getPosts);
router.post('/', postValidation, postsController.createPost);
router.put('/:id', postValidation, postsController.updatePost);
router.delete('/:id', postsController.deletePost);

export default router;

// app.ts
import postsRouter from './routes/posts.routes';
app.use('/api/v1/posts', postsRouter);
```

### 12. Replace body-parser (Deprecated)
**Files**: `backend/app.ts:2, 7-8`
**Problem**: body-parser is deprecated, now built into Express
**Fix**: Use Express built-in parsers
```typescript
// Remove:
import bodyParser from 'body-parser';
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Replace with:
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
```

### 13. Proper Logging System
**Files**: All `console.log` statements throughout codebase
**Problem**: Using console.log for debugging in production code
**Impact**: No log levels, no file logging, hard to debug production issues
**Fix**: Use Winston or Pino
```bash
npm install winston
```
```typescript
// backend/config/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Usage:
logger.info('Post created', { postId: savedPost._id });
logger.error('Failed to update post', { error: error.message });
```

### 14. Remove Debug Console.logs from Frontend
**Files**:
- `src/app/posts/posts.service.ts:44, 50, 53`
- `src/app/posts/post-create/post-create.ts:34, 36, 42, 47, 49, 53, 59`
- `src/app/posts/post-list/post-list.ts:35`
- `src/app/app.ts:17`

**Problem**: Debug logs left in code
**Fix**: Remove or use environment-based logging
```typescript
// Option 1: Remove all debug logs

// Option 2: Environment-based logging
import { environment } from '../../environments/environment';

private log(message: string, data?: any) {
  if (!environment.production) {
    console.log(message, data);
  }
}
```

### 15. API Versioning
**Files**: `backend/app.ts` (all routes)
**Problem**: No API versioning, breaking changes affect all clients
**Fix**: Version your API
```typescript
app.use('/api/v1/posts', postsRouter);
```

### 16. Global Error Handler Middleware
**Files**: `backend/app.ts` (missing)
**Problem**: Unhandled errors crash server or return inconsistent responses
**Fix**: Add global error handler
```typescript
// Add at the end of app.ts before export
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error:', err);

  const statusCode = (err as any).statusCode || 500;
  res.status(statusCode).json({
    error: {
      message: process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    }
  });
});
```

---

## Low Priority (Nice to Have)

### 17. HTTP Request Logging
**Files**: `backend/app.ts` (missing)
**Fix**: Add Morgan for HTTP request logging
```bash
npm install morgan @types/morgan
```
```typescript
import morgan from 'morgan';
app.use(morgan('combined'));
```

### 18. Compression Middleware
**Files**: `backend/app.ts` (missing)
**Fix**: Compress HTTP responses
```bash
npm install compression
```
```typescript
import compression from 'compression';
app.use(compression());
```

### 19. Health Check Endpoint
**Files**: `backend/app.ts` (missing)
**Fix**: Add endpoint for monitoring/load balancers
```typescript
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'connected' // Check actual DB connection
  });
});
```

### 20. Pagination for GET Posts
**Files**: `backend/app.ts:44-64`, `src/app/posts/posts.service.ts`
**Problem**: Loading ALL posts becomes slow with many records
**Fix**: Add pagination
```typescript
// Backend
app.get('/api/posts', async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const posts = await Post.find().skip(skip).limit(limit);
  const total = await Post.countDocuments();

  res.json({
    posts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});
```

---

## Completed Items

### [DONE] MongoDB Connection with Graceful Shutdown
**Files**: `backend/database.ts`, `server.ts`
**Status**: Implemented - Database connection with proper error handling and graceful shutdown on SIGTERM/SIGINT

### [DONE] TypeScript Migration
**Files**: All backend files
**Status**: Complete - Backend fully migrated to TypeScript with strict mode

### [DONE] PUT Method Added to CORS
**Files**: `backend/app.ts:13`
**Status**: Fixed - PUT method added to allowed CORS methods

---

## Progress Summary

**Critical**: 0/5 completed
**High Priority**: 0/10 completed
**Medium Priority**: 0/6 completed
**Low Priority**: 0/4 completed
**Total**: 0/25 items remaining

## Notes

- **Critical items** must be fixed before any production deployment
- **High priority items** are architectural issues that will cause problems as the app grows
- **Medium priority items** are code quality and maintainability improvements
- **Low priority items** are nice-to-have optimizations
