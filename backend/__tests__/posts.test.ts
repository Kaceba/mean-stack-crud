import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import { Post } from '../models/post.model';

describe('Posts API', () => {
  beforeAll(async () => {
    // Connect to in-memory MongoDB
    const mongoUri = (global as any).__MONGO_URI__;
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    // Clean up and close connection
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear posts before each test
    await Post.deleteMany({});
  });

  describe('POST /api/posts', () => {
    it('should create a new post', async () => {
      const newPost = {
        title: 'Test Post',
        content: 'This is a test post content',
      };

      const response = await request(app)
        .post('/api/posts')
        .send(newPost)
        .expect(201);

      expect(response.body.message).toBe('Post added successfully');
      expect(response.body.post).toHaveProperty('id');
      expect(response.body.post.title).toBe(newPost.title);
      expect(response.body.post.content).toBe(newPost.content);
      expect(response.body.post).toHaveProperty('createdAt');
      expect(response.body.post).toHaveProperty('updatedAt');
    });

    it('should fail to create post with missing title', async () => {
      const invalidPost = {
        content: 'Content without title',
      };

      const response = await request(app)
        .post('/api/posts')
        .send(invalidPost)
        .expect(500);

      expect(response.body.message).toBe('Failed to create post');
    });

    it('should fail to create post with title too short', async () => {
      const invalidPost = {
        title: 'AB', // Less than 3 characters
        content: 'Valid content',
      };

      const response = await request(app)
        .post('/api/posts')
        .send(invalidPost)
        .expect(500);

      expect(response.body.message).toBe('Failed to create post');
    });
  });

  describe('GET /api/posts', () => {
    it('should return empty array when no posts exist', async () => {
      const response = await request(app).get('/api/posts').expect(200);

      expect(response.body.message).toBe('Posts fetched successfully!');
      expect(response.body.posts).toEqual([]);
    });

    it('should return all posts', async () => {
      // Create test posts
      await Post.create([
        { title: 'First Post', content: 'First content' },
        { title: 'Second Post', content: 'Second content' },
        { title: 'Third Post', content: 'Third content' },
      ]);

      const response = await request(app).get('/api/posts').expect(200);

      expect(response.body.message).toBe('Posts fetched successfully!');
      expect(response.body.posts).toHaveLength(3);
      expect(response.body.posts[0].title).toBe('First Post');
      expect(response.body.posts[1].title).toBe('Second Post');
      expect(response.body.posts[2].title).toBe('Third Post');
    });

    it('should return posts with all required fields', async () => {
      await Post.create({ title: 'Test Post', content: 'Test content' });

      const response = await request(app).get('/api/posts').expect(200);

      const post = response.body.posts[0];
      expect(post).toHaveProperty('id');
      expect(post).toHaveProperty('title');
      expect(post).toHaveProperty('content');
      expect(post).toHaveProperty('createdAt');
      expect(post).toHaveProperty('updatedAt');
    });
  });

  describe('PUT /api/posts/:id', () => {
    it('should update an existing post', async () => {
      // Create a post to update
      const post = await Post.create({
        title: 'Original Title',
        content: 'Original content',
      });

      const updatedData = {
        title: 'Updated Title',
        content: 'Updated content',
      };

      const response = await request(app)
        .put(`/api/posts/${post._id}`)
        .send(updatedData)
        .expect(200);

      expect(response.body.message).toBe('Post updated successfully');
      expect(response.body.post.title).toBe(updatedData.title);
      expect(response.body.post.content).toBe(updatedData.content);
      expect(response.body.post.id).toBe(post._id.toString());
    });

    it('should return 404 for non-existent post', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .put(`/api/posts/${fakeId}`)
        .send({ title: 'Updated Title', content: 'Updated content' })
        .expect(404);

      expect(response.body.message).toBe('Post not found');
    });

    it('should fail with invalid ObjectId', async () => {
      const response = await request(app)
        .put('/api/posts/invalid-id')
        .send({ title: 'Updated Title', content: 'Updated content' })
        .expect(500);

      expect(response.body.message).toBe('Failed to update post');
    });

    it('should validate title length on update', async () => {
      const post = await Post.create({
        title: 'Valid Title',
        content: 'Valid content',
      });

      const response = await request(app)
        .put(`/api/posts/${post._id}`)
        .send({ title: 'AB', content: 'Valid content' }) // Title too short
        .expect(500);

      expect(response.body.message).toBe('Failed to update post');
    });
  });

  describe('DELETE /api/posts/:id', () => {
    it('should delete an existing post', async () => {
      // Create a post to delete
      const post = await Post.create({
        title: 'Post to Delete',
        content: 'This will be deleted',
      });

      const response = await request(app)
        .delete(`/api/posts/${post._id}`)
        .expect(200);

      expect(response.body.message).toBe('Post deleted successfully');
      expect(response.body.postId).toBe(post._id.toString());

      // Verify post is actually deleted
      const deletedPost = await Post.findById(post._id);
      expect(deletedPost).toBeNull();
    });

    it('should return 404 for non-existent post', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/posts/${fakeId}`)
        .expect(404);

      expect(response.body.message).toBe('Post not found');
    });

    it('should fail with invalid ObjectId', async () => {
      const response = await request(app)
        .delete('/api/posts/invalid-id')
        .expect(500);

      expect(response.body.message).toBe('Failed to delete post');
    });
  });
});
