import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-post-create',
  imports: [],
  templateUrl: './post-create.html',
  styleUrl: './post-create.css'
})
export class PostCreate {
  enteredTitle = '';
  enteredContent = '';
  @Output() postCreated = new EventEmitter<{title: string, content: string}>();

  onAddPost(postInput: HTMLTextAreaElement) {
    console.dir(postInput);
    const post = { 
      title: this.enteredTitle, 
      content: this.enteredContent
    };
    this.postCreated.emit(post);
  }
}
