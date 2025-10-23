import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import { Post } from './models/post.model';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

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

app.post('/api/posts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
    });

    const savedPost = await post.save();

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
    res.status(500).json({
      message: 'Failed to create post',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.get('/api/posts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const posts = await Post.find();

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
    res.status(500).json({
      message: 'Failed to fetch posts',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.put('/api/posts/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        content: req.body.content,
      },
      { new: true, runValidators: true },
    );

    if (!updatedPost) {
      return res.status(404).json({
        message: 'Post not found',
      });
    }

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
    return res.status(500).json({
      message: 'Failed to update post',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.delete('/api/posts/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deletedPost = await Post.findByIdAndDelete(req.params.id);

    if (!deletedPost) {
      return res.status(404).json({
        message: 'Post not found',
      });
    }

    return res.status(200).json({
      message: 'Post deleted successfully',
      postId: req.params.id,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to delete post',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default app;
