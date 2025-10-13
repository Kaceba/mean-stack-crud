import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PostCreate } from './posts/post-create/post-create';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PostCreate],
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class App {
  protected readonly title = signal('mean-course');
}
