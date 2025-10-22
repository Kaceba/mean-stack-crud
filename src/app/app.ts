import { Component } from '@angular/core';
import { PostCreate } from './posts/post-create/post-create';
import { Header } from './header/header';
import { PostList } from './posts/post-list/post-list';
import { Post } from './posts/post.model';

@Component({
  selector: 'app-root',
  imports: [PostCreate, Header, PostList],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  postToEdit: Post | null = null;

  onPostEdit(post: Post) {
    console.log('APP: Received post to edit:', post);
    this.postToEdit = post;
  }
}
