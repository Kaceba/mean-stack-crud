# MEAN Stack CRUD Application

A full-stack application demonstrating CRUD operations using the MEAN stack (MongoDB, Express.js, Angular, Node.js) with TypeScript.

## Features

- **Full CRUD Operations**: Create, Read, Update, and Delete posts
- **RESTful API**: Express.js backend with proper HTTP methods (GET, POST, PUT, DELETE)
- **MongoDB Integration**: Persistent data storage with Mongoose ODM
- **TypeScript**: Fully typed codebase on both frontend and backend
- **Angular Material**: Modern, responsive UI components
- **Reactive Forms**: Form validation and error handling
- **Real-time Updates**: RxJS observables for reactive state management
- **Dockerized Database**: MongoDB running in Docker container
- **Environment Configuration**: Proper separation of dev/prod configurations

## Tech Stack

### Frontend
- Angular 20+
- TypeScript 5.9
- Angular Material Design
- RxJS for reactive programming
- Reactive Forms with validation

### Backend
- Node.js
- Express.js 5
- TypeScript 5.9
- Mongoose (MongoDB ODM)
- CORS enabled

### Database
- MongoDB 7.0
- Docker containerized
- Mongoose schema validation

## Project Structure

```
mean-course/
├── backend/
│   ├── models/
│   │   └── post.model.ts       # Mongoose schema with validation
│   ├── app.ts                  # Express app configuration and routes
│   └── database.ts             # MongoDB connection management
├── src/
│   └── app/
│       ├── header/             # Header component
│       └── posts/
│           ├── post-create/    # Create/Edit form component
│           ├── post-list/      # List display component
│           ├── posts.service.ts # HTTP service for API calls
│           └── post.model.ts   # Post interface
├── server.ts                   # Node.js server entry point
└── docker-compose.yml          # MongoDB container configuration
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts` | Get all posts |
| POST | `/api/posts` | Create new post |
| PUT | `/api/posts/:id` | Update existing post |
| DELETE | `/api/posts/:id` | Delete post |

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- Docker and Docker Compose
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd mean-course
```

2. Install dependencies
```bash
npm install
```

3. Create environment file (.env)
```
MONGO_USERNAME=admin
MONGO_PASSWORD=password123
MONGO_HOST=localhost
MONGO_PORT=27018
MONGO_DATABASE=mean-course
MONGODB_URI=mongodb://admin:password123@localhost:27018/mean-course?authSource=admin
NODE_ENV=development
PORT=3000
```

4. Start MongoDB container
```bash
docker-compose up -d
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

### Frontend
- `npm start` - Start Angular dev server (http://localhost:4200)
- `npm run build` - Build for production
- `npm test` - Run unit tests

### Backend
- `npm run start:server` - Start backend server (http://localhost:3000)
- `npm run debug:server` - Start server with debugger
- `npm run build:server` - Compile TypeScript to JavaScript

### Database
- `docker-compose up -d` - Start MongoDB container
- `docker-compose down` - Stop MongoDB container
- `docker-compose logs` - View MongoDB logs

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
- **Async/Await**: Modern asynchronous JavaScript patterns
- **Error Handling**: Proper try/catch blocks and HTTP status codes
- **Graceful Shutdown**: Database connection cleanup on process termination
- **Environment Variables**: Sensitive data stored in .env files (gitignored)

## Future Improvements

See [TODO.md](TODO.md) for planned enhancements including:
- Input validation with express-validator
- User authentication & authorization
- Pagination for large datasets
- Rate limiting and security headers
- API versioning
- Error feedback to users (toasts/snackbars)
- Loading states and spinners
- Unit and integration tests
- Proper logging system (Winston)

## Development Notes

This project demonstrates:
- Building RESTful APIs with Express.js and TypeScript
- MongoDB integration with Mongoose ODM
- Angular Material Design implementation
- Reactive programming with RxJS
- Docker containerization
- Full-stack TypeScript development
- CRUD operations with proper HTTP methods
- Form validation on both client and server

## License

MIT
