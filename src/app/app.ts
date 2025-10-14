import { Component } from '@angular/core';
import { PostCreate } from './posts/post-create/post-create';
import { Header } from './header/header';
import { PostList } from './posts/post-list/post-list';

@Component({
  selector: 'app-root',
  imports: [PostCreate, Header, PostList],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
