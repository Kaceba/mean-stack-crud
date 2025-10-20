import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Post } from './post.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();

  constructor(private http: HttpClient) { }

  getPosts(): void {
    this.http.get<{ message: string; posts: Post[] }>('http://localhost:3000/api/posts')
      .subscribe((postData) => {
        this.posts = postData.posts;
        this.postsUpdated.next([...this.posts]);
      });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  getPost(id: string): Post | undefined {
    return this.posts.find(p => p.id === id);
  }

  addPost(title: string, content: string): void {
    const post: Post = { id: null, title: title, content: content };
    this.http.post<{ message: string; post: Post }>('http://localhost:3000/api/posts', post)
      .subscribe((responseData) => {
        console.log(responseData.message);
        this.posts.push(responseData.post);
        this.postsUpdated.next([...this.posts]);
      });
  }

  updatePost(id: string, title: string, content: string): void {
    const post: Post = { id: id, title: title, content: content };
    this.http.put<{ message: string; post: Post }>(`http://localhost:3000/api/posts/${id}`, post)
      .subscribe((responseData) => {
        console.log(responseData.message);
        const updatedPosts = [...this.posts];
        const oldPostIndex = updatedPosts.findIndex(p => p.id === id);
        updatedPosts[oldPostIndex] = responseData.post;
        this.posts = updatedPosts;
        this.postsUpdated.next([...this.posts]);
      });
  }

  deletePost(postId: string): void {
    this.http.delete<{ message: string }>(`http://localhost:3000/api/posts/${postId}`)
      .subscribe((responseData) => {
        console.log(responseData.message);
        const updatedPosts = this.posts.filter(post => post.id !== postId);
        this.posts = updatedPosts;
        this.postsUpdated.next([...this.posts]);
      });
  }
}
