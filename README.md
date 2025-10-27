# MEAN Stack CRUD Application

A full-stack TypeScript application demonstrating CRUD operations using the MEAN stack (MongoDB, Express.js, Angular, Node.js).

## Why This Project?

This project demonstrates **production-ready development patterns** while keeping focus on core CRUD operations. Every architectural decision, from choosing MongoDB over PostgreSQL, to deferring authentication—is documented with rationale in [DECISIONS.md](./DECISIONS.md).

**Key Learning Objectives:**
- Full-stack TypeScript development (single language, end-to-end type safety)
- RESTful API design with proper error handling
- Production deployment with Docker (multi-stage builds, container orchestration)
- Observability fundamentals (logging, health checks, metrics)
- Test-driven development (29 passing tests)

**Not a Tutorial Project:** This isn't following a course, it's a portfolio piece showcasing professional engineering judgment and production thinking within a focused scope.

## Features

- **Full CRUD Operations**: Create, Read, Update, and Delete posts
- **RESTful API**: Express.js backend with proper HTTP methods (GET, POST, PUT, DELETE)
- **MongoDB Integration**: Persistent data storage with Mongoose ODM
- **TypeScript**: Fully typed codebase on both frontend and backend
- **Angular Material**: Modern, responsive UI components
- **Reactive Forms**: Form validation and error handling
- **Real-time Updates**: RxJS observables for reactive state management
- **Fully Dockerized**: Frontend (Nginx), Backend (Node.js), and Database (MongoDB) all containerized
- **Production Ready**: Multi-stage Docker builds with optimized images
- **Observability**: Structured logging, health checks, and metrics endpoints
- **CORS Security**: Restricted cross-origin access for secure communication

## Tech Stack

### Frontend
- Angular 20+
- TypeScript 5.9
- Angular Material Design
- RxJS for reactive programming
- Reactive Forms with validation
- Nginx (production web server)
- Docker multi-stage build

### Backend
- Node.js 20
- Express.js 5
- TypeScript 5.9
- Mongoose (MongoDB ODM)
- Winston (structured logging)
- CORS with origin restrictions
- Docker containerized
- Health checks and metrics

### Database
- MongoDB 7.0
- Docker containerized
- Mongoose schema validation
- Health checks for service dependencies

## Project Structure

```
mean-course/
├── backend/
│   ├── config/
│   │   └── logger.ts           # Winston logging configuration
│   ├── middleware/
│   │   ├── requestLogger.ts    # HTTP request logging middleware
│   │   └── metrics.ts          # Metrics tracking middleware
│   ├── models/
│   │   └── post.model.ts       # Mongoose schema with validation
│   ├── __tests__/
│   │   └── posts.test.ts       # Backend API tests (Jest + Supertest)
│   ├── app.ts                  # Express app configuration and routes
│   ├── database.ts             # MongoDB connection management
│   └── Dockerfile              # Backend container configuration
├── src/
│   └── app/
│       ├── header/             # Header component
│       └── posts/
│           ├── post-create/    # Create/Edit form component
│           ├── post-list/      # List display component
│           ├── posts.service.ts       # HTTP service for API calls
│           ├── posts.service.spec.ts  # Service tests
│           └── post.model.ts   # Post interface
├── server.ts                   # TypeScript server entry point
├── Dockerfile                  # Frontend container configuration
├── nginx.conf                  # Nginx configuration for Angular SPA
├── docker-compose.yml          # Multi-container orchestration
├── .env.example                # Environment variables template
├── DECISIONS.md                # Architecture Decision Records (ADRs)
└── .dockerignore               # Docker build context exclusions
```

## API Endpoints

### CRUD Operations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts` | Get all posts |
| POST | `/api/posts` | Create new post |
| PUT | `/api/posts/:id` | Update existing post |
| DELETE | `/api/posts/:id` | Delete post |

### Observability
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check (database status, memory, uptime) |
| GET | `/metrics` | Application metrics (requests, errors, performance) |

**Example Health Check Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-24T12:17:26.417Z",
  "uptime": 55.72,
  "environment": "development",
  "checks": {
    "database": "connected",
    "memory": {
      "used": 261,
      "total": 267,
      "unit": "MB"
    }
  }
}
```

**Example Metrics Response:**
```json
{
  "requests": {
    "total": 10,
    "byMethod": { "GET": 6, "POST": 1, "PUT": 1, "DELETE": 2 }
  },
  "responses": {
    "total": 9,
    "byStatus": { "2xx": 8, "4xx": 0, "5xx": 1 }
  },
  "posts": { "created": 1, "updated": 1, "deleted": 1 },
  "errors": { "total": 1 },
  "performance": { "averageResponseTime": 12, "unit": "ms" }
}
```

## Setup Instructions

### Prerequisites
- Docker and Docker Compose
- (Optional) Node.js v20+ and npm for local development

### Quick Start with Docker (Recommended)

1. Clone the repository
```bash
git clone https://github.com/Kaceba/mean-stack-crud.git
cd mean-stack-crud
```

2. Set up environment variables
```bash
cp .env.example .env
# Edit .env and change the default credentials (recommended for security)
```

3. Build and start all containers
```bash
docker-compose up -d --build
```

4. Open browser to `http://localhost:4200`

5. Verify the application is running (optional)
```bash
# Check health endpoint
curl http://localhost:3000/health

# Check metrics
curl http://localhost:3000/metrics
```

6. Stop all containers
```bash
docker-compose down
```

That's it! The entire application (frontend, backend, and database) runs in Docker.

### Local Development Setup (Without Docker)

1. Clone the repository
```bash
git clone https://github.com/Kaceba/mean-stack-crud.git
cd mean-stack-crud
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env if you want to change default credentials
# Note: For local development, ensure MONGODB_URI uses localhost:27017
```

4. Start MongoDB container
```bash
docker-compose up mongodb -d
```

5. Start the backend server
```bash
npm run start:server
```

6. Start the Angular development server (in a new terminal)
```bash
npm start
```

7. Open browser to `http://localhost:4200`

## Available Scripts

### Docker Commands
- `docker-compose up -d --build` - Build and start all containers (frontend, backend, database)
- `docker-compose down` - Stop all containers
- `docker-compose logs -f` - View logs from all services
- `docker-compose logs -f backend` - View backend logs only
- `docker-compose restart backend` - Restart backend after code changes

### Testing

#### Backend Tests (Jest + Supertest)
- `npm run test:backend` - Run backend API tests
- `npm run test:backend:watch` - Run tests in watch mode
- `npm run test:backend:coverage` - Run tests with coverage report

**Backend Test Coverage:**
- ✅ POST /api/posts - Create post with validation
- ✅ GET /api/posts - Fetch all posts
- ✅ PUT /api/posts/:id - Update post with validation
- ✅ DELETE /api/posts/:id - Delete post
- ✅ Error handling for invalid IDs and missing posts
- **13 tests passing**

#### Frontend Tests (Karma + Jasmine)
- `npm test` - Run Angular unit tests
- `npm test -- --watch=false` - Run tests once (CI mode)
- `npm test -- --browsers=ChromeHeadless --watch=false` - Run headless for CI

**Frontend Test Coverage:**
- ✅ PostsService HTTP operations (GET, POST, PUT, DELETE)
- ✅ Component creation and initialization
- ✅ Observable state management
- **16 tests passing**

### Local Development Scripts

#### Frontend
- `npm start` - Start Angular dev server (http://localhost:4200)
- `npm run build` - Build for production

#### Backend
- `npm run start:server` - Start backend server (http://localhost:3000)
- `npm run debug:server` - Start server with debugger
- `npm run build:server` - Compile TypeScript to JavaScript

## Key Implementation Details

### Mongoose Schema Validation
```typescript
const postSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  }
}, { timestamps: true });
```

### RESTful API with Error Handling
```typescript
app.put('/api/posts/:id', async (req, res) => {
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { title: req.body.title, content: req.body.content },
      { new: true, runValidators: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    return res.status(200).json({ message: 'Post updated', post: updatedPost });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update post' });
  }
});
```

### Reactive Forms with Validation
```typescript
this.postForm = new FormGroup({
  title: new FormControl(null, {
    validators: [Validators.required, Validators.minLength(3)]
  }),
  content: new FormControl(null, {
    validators: [Validators.required]
  })
});
```

### RxJS Observable Pattern
```typescript
private postsUpdated = new Subject<Post[]>();

getPostUpdateListener() {
  return this.postsUpdated.asObservable();
}

// Components subscribe to updates
this.postsService.getPostUpdateListener()
  .subscribe((posts: Post[]) => {
    this.posts = posts;
  });
```

## Architecture Highlights

- **Separation of Concerns**: Clear separation between components, services, and models
- **TypeScript Strict Mode**: Enhanced type safety across the entire codebase
- **Async/Await**: Modern asynchronous patterns with proper typing
- **Error Handling**: Proper try/catch blocks and HTTP status codes
- **Graceful Shutdown**: Database connection cleanup on process termination
- **Environment Variables**: Sensitive data stored in .env files (gitignored)
- **Structured Logging**: Winston logger with JSON formatting and file outputs
- **Health Checks**: Database connectivity and memory usage monitoring
- **Metrics Tracking**: Request counts, error rates, and response time monitoring
- **Comprehensive Testing**: 29 tests covering backend APIs and frontend services

## What's NOT Included (Intentional Scope Decisions)

This project intentionally focuses on CRUD operations and production deployment patterns. The following features are **deliberately excluded** with documented rationale:

### Authentication & Authorization
**Status:** Deferred (see [DECISIONS.md ADR-004](./DECISIONS.md#adr-004-defer-authentication-implementation))

**Rationale:** Authentication is a separate concern (identity management vs. data management). Adding it would muddle the project's focus on CRUD operations. For production systems requiring user authentication, established solutions like Passport.js or Auth0 are industry best practices.

### CI/CD Pipeline
**Status:** Intentionally excluded

**Rationale:** For a completed portfolio piece that won't be actively developed, CI/CD adds complexity without value. The project has comprehensive tests (29 passing) that can be run manually. For a team environment with continuous deployment, I would add GitHub Actions.

## Docker Architecture

The application uses a three-container architecture:

```
Browser → http://localhost:4200
    ↓
Nginx Container (serves Angular static files)
    ↓
Browser JavaScript makes API calls → http://localhost:3000
    ↓
Backend Container (Node.js + Express + TypeScript)
    ↓
MongoDB Container (internal network, mongodb:27017)
```

**Key Features:**
- **Multi-stage builds**: Frontend uses build stage (Node.js) and runtime stage (Nginx) for optimized image size
- **Service dependencies**: Backend waits for MongoDB health check before starting
- **Docker networking**: All containers communicate on internal `mean-network`
- **CORS security**: Backend only accepts requests from specific frontend origins
- **Volume persistence**: MongoDB data persists across container restarts

## Development Notes

This project demonstrates:
- Building RESTful APIs with TypeScript and Express.js
- MongoDB integration with Mongoose ODM and schema validation
- Angular Material Design implementation with TypeScript
- Reactive programming patterns using RxJS
- **Production-ready Docker containerization with multi-stage builds**
- **Nginx as a production web server for Angular applications**
- **Container orchestration with Docker Compose and health checks**
- Full-stack TypeScript development with strict type checking
- CRUD operations following RESTful conventions
- End-to-end type safety from database to UI
- **CORS configuration for secure cross-origin communication**
