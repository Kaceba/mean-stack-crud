import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import { Post } from './models/post.model';
import { logger } from './config/logger';
import { requestLogger } from './middleware/requestLogger';
import { metrics, incrementMetric, recordResponseTime, getAverageResponseTime } from './middleware/metrics';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Request logging middleware
app.use(requestLogger);

// Metrics tracking middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // Increment request counter
  incrementMetric('requests.total');
  incrementMetric(`requests.byMethod.${req.method}`);

  res.on('finish', () => {
    // Record response time
    const duration = Date.now() - start;
    recordResponseTime(duration);

    // Increment response counter
    incrementMetric('responses.total');

    // Track by status code range
    const statusRange = Math.floor(res.statusCode / 100);
    if (statusRange === 2) incrementMetric('responses.byStatus.2xx');
    else if (statusRange === 4) incrementMetric('responses.byStatus.4xx');
    else if (statusRange === 5) incrementMetric('responses.byStatus.5xx');
  });

  next();
});

app.use((req: Request, res: Response, next: NextFunction) => {
  const allowedOrigins = [
    'http://localhost:4200',           // Development frontend
  ];

  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    checks: {
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: 'MB',
      },
    },
  };

  const statusCode = health.checks.database === 'connected' ? 200 : 503;
  logger.info('Health check requested', { status: health.status, database: health.checks.database });
  res.status(statusCode).json(health);
});

// Metrics endpoint
app.get('/metrics', (req: Request, res: Response) => {
  const metricsData = {
    ...metrics,
    performance: {
      averageResponseTime: getAverageResponseTime(),
      unit: 'ms',
    },
  };

  logger.info('Metrics requested');
  res.json(metricsData);
});

app.post('/api/posts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info('Creating new post', { title: req.body.title });

    const post = new Post({
      title: req.body.title,
      content: req.body.content,
    });

    const savedPost = await post.save();
    incrementMetric('posts.created');

    logger.info('Post created successfully', { postId: savedPost._id });

    res.status(201).json({
      message: 'Post added successfully',
      post: {
        id: savedPost._id,
        title: savedPost.title,
        content: savedPost.content,
        createdAt: savedPost.createdAt,
        updatedAt: savedPost.updatedAt,
      },
    });
  } catch (error) {
    incrementMetric('errors.total');
    logger.error('Failed to create post', { error: error instanceof Error ? error.message : 'Unknown error' });

    res.status(500).json({
      message: 'Failed to create post',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.get('/api/posts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info('Fetching all posts');

    const posts = await Post.find();

    logger.info('Posts fetched successfully', { count: posts.length });

    res.status(200).json({
      message: 'Posts fetched successfully!',
      posts: posts.map((post) => ({
        id: post._id,
        title: post.title,
        content: post.content,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      })),
    });
  } catch (error) {
    incrementMetric('errors.total');
    logger.error('Failed to fetch posts', { error: error instanceof Error ? error.message : 'Unknown error' });

    res.status(500).json({
      message: 'Failed to fetch posts',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.put('/api/posts/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info('Updating post', { postId: req.params.id, title: req.body.title });

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        content: req.body.content,
      },
      { new: true, runValidators: true },
    );

    if (!updatedPost) {
      logger.warn('Post not found for update', { postId: req.params.id });
      return res.status(404).json({
        message: 'Post not found',
      });
    }

    incrementMetric('posts.updated');
    logger.info('Post updated successfully', { postId: updatedPost._id });

    return res.status(200).json({
      message: 'Post updated successfully',
      post: {
        id: updatedPost._id,
        title: updatedPost.title,
        content: updatedPost.content,
        createdAt: updatedPost.createdAt,
        updatedAt: updatedPost.updatedAt,
      },
    });
  } catch (error) {
    incrementMetric('errors.total');
    logger.error('Failed to update post', { postId: req.params.id, error: error instanceof Error ? error.message : 'Unknown error' });

    return res.status(500).json({
      message: 'Failed to update post',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.delete('/api/posts/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info('Deleting post', { postId: req.params.id });

    const deletedPost = await Post.findByIdAndDelete(req.params.id);

    if (!deletedPost) {
      logger.warn('Post not found for deletion', { postId: req.params.id });
      return res.status(404).json({
        message: 'Post not found',
      });
    }

    incrementMetric('posts.deleted');
    logger.info('Post deleted successfully', { postId: req.params.id });

    return res.status(200).json({
      message: 'Post deleted successfully',
      postId: req.params.id,
    });
  } catch (error) {
    incrementMetric('errors.total');
    logger.error('Failed to delete post', { postId: req.params.id, error: error instanceof Error ? error.message : 'Unknown error' });

    return res.status(500).json({
      message: 'Failed to delete post',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default app;
