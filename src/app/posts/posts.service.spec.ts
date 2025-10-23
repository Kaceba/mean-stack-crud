import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PostsService } from './posts.service';
import { Post } from './post.model';

describe('PostsService', () => {
  let service: PostsService;
  let httpMock: HttpTestingController;
  const API_URL = 'http://localhost:3000/api/posts';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PostsService],
    });
    service = TestBed.inject(PostsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verify no outstanding HTTP requests
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPosts', () => {
    it('should fetch posts and update the subject', (done) => {
      const mockPosts: Post[] = [
        { id: '1', title: 'Test Post 1', content: 'Content 1' },
        { id: '2', title: 'Test Post 2', content: 'Content 2' },
      ];

      const mockResponse = {
        message: 'Posts fetched successfully!',
        posts: mockPosts,
      };

      // Subscribe to the update listener
      service.getPostUpdateListener().subscribe((posts) => {
        expect(posts).toEqual(mockPosts);
        expect(posts.length).toBe(2);
        done();
      });

      // Call the service method
      service.getPosts();

      // Expect HTTP request and respond with mock data
      const req = httpMock.expectOne(API_URL);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle empty posts array', (done) => {
      const mockResponse = {
        message: 'Posts fetched successfully!',
        posts: [],
      };

      service.getPostUpdateListener().subscribe((posts) => {
        expect(posts).toEqual([]);
        expect(posts.length).toBe(0);
        done();
      });

      service.getPosts();

      const req = httpMock.expectOne(API_URL);
      req.flush(mockResponse);
    });
  });

  describe('addPost', () => {
    it('should add a new post and update the subject', (done) => {
      const newPost = { id: null, title: 'New Post', content: 'New Content' };
      const savedPost: Post = { id: '123', title: 'New Post', content: 'New Content' };
      const mockResponse = {
        message: 'Post added successfully',
        post: savedPost,
      };

      service.getPostUpdateListener().subscribe((posts) => {
        expect(posts.length).toBe(1);
        expect(posts[0]).toEqual(savedPost);
        done();
      });

      service.addPost(newPost.title, newPost.content);

      const req = httpMock.expectOne(API_URL);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newPost);
      req.flush(mockResponse);
    });
  });

  describe('updatePost', () => {
    it('should update an existing post', (done) => {
      // First, populate the service with a post
      const existingPost: Post = { id: '1', title: 'Original', content: 'Original Content' };
      const updatedPost: Post = { id: '1', title: 'Updated', content: 'Updated Content' };
      const mockResponse = {
        message: 'Post updated successfully',
        post: updatedPost,
      };

      // Manually set up the service state
      (service as any).posts = [existingPost];

      service.getPostUpdateListener().subscribe((posts) => {
        expect(posts.length).toBe(1);
        expect(posts[0].title).toBe('Updated');
        expect(posts[0].content).toBe('Updated Content');
        done();
      });

      service.updatePost('1', 'Updated', 'Updated Content');

      const req = httpMock.expectOne(`${API_URL}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedPost);
      req.flush(mockResponse);
    });

    it('should not update if post not found in local array', () => {
      const updatedPost: Post = { id: '999', title: 'Updated', content: 'Updated Content' };
      const mockResponse = {
        message: 'Post updated successfully',
        post: updatedPost,
      };

      // Set up empty posts array
      (service as any).posts = [];

      // Should not emit any update
      let emitted = false;
      service.getPostUpdateListener().subscribe(() => {
        emitted = true;
      });

      service.updatePost('999', 'Updated', 'Updated Content');

      const req = httpMock.expectOne(`${API_URL}/999`);
      req.flush(mockResponse);

      // Give time for subscription to potentially emit
      setTimeout(() => {
        expect(emitted).toBe(false);
      }, 100);
    });
  });

  describe('deletePost', () => {
    it('should delete a post and update the subject', (done) => {
      const post1: Post = { id: '1', title: 'Post 1', content: 'Content 1' };
      const post2: Post = { id: '2', title: 'Post 2', content: 'Content 2' };

      // Manually set up the service state
      (service as any).posts = [post1, post2];

      service.getPostUpdateListener().subscribe((posts) => {
        expect(posts.length).toBe(1);
        expect(posts[0].id).toBe('2');
        done();
      });

      service.deletePost('1');

      const req = httpMock.expectOne(`${API_URL}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ message: 'Post deleted successfully' });
    });

    it('should handle deleting non-existent post', (done) => {
      const post1: Post = { id: '1', title: 'Post 1', content: 'Content 1' };

      // Manually set up the service state
      (service as any).posts = [post1];

      service.getPostUpdateListener().subscribe((posts) => {
        expect(posts.length).toBe(1); // Should remain unchanged
        expect(posts[0].id).toBe('1');
        done();
      });

      service.deletePost('999'); // Delete non-existent post

      const req = httpMock.expectOne(`${API_URL}/999`);
      req.flush({ message: 'Post deleted successfully' });
    });
  });

  describe('getPost', () => {
    it('should return a post by id', () => {
      const posts: Post[] = [
        { id: '1', title: 'Post 1', content: 'Content 1' },
        { id: '2', title: 'Post 2', content: 'Content 2' },
      ];

      (service as any).posts = posts;

      const result = service.getPost('1');
      expect(result).toEqual(posts[0]);
    });

    it('should return undefined for non-existent id', () => {
      const posts: Post[] = [{ id: '1', title: 'Post 1', content: 'Content 1' }];

      (service as any).posts = posts;

      const result = service.getPost('999');
      expect(result).toBeUndefined();
    });
  });

  describe('getPostUpdateListener', () => {
    it('should return an observable', () => {
      const listener = service.getPostUpdateListener();
      expect(listener).toBeDefined();
      expect(typeof listener.subscribe).toBe('function');
    });
  });
});
