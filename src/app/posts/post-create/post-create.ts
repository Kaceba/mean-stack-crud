import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { PostsService } from '../posts.service';
import { Post } from '../post.model';

@Component({
  selector: 'app-post-create',
  imports: [ReactiveFormsModule, MatInputModule, MatFormFieldModule, MatButtonModule],
  templateUrl: './post-create.html',
  styleUrl: './post-create.css'
})
export class PostCreate implements OnInit, OnChanges {
  @Input() postToEdit: Post | null = null;
  postForm!: FormGroup;
  mode = 'create';

  constructor(private postsService: PostsService) {}

  ngOnInit() {
    this.postForm = new FormGroup({
      title: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)]
      }),
      content: new FormControl(null, {
        validators: [Validators.required]
      })
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('POST-CREATE: ngOnChanges called:', changes);
    if (changes['postToEdit'] && this.postToEdit) {
      console.log('POST-CREATE: Setting edit mode with post:', this.postToEdit);
      this.mode = 'edit';
      this.postForm.setValue({
        title: this.postToEdit.title,
        content: this.postToEdit.content
      });
      console.log('POST-CREATE: Form populated, mode:', this.mode);
    }
  }

  onSavePost() {
    console.log('POST-CREATE: onSavePost called, mode:', this.mode, 'postToEdit:', this.postToEdit);
    if (this.postForm.invalid) {
      console.log('POST-CREATE: Form invalid');
      return;
    }
    if (this.mode === 'create') {
      console.log('POST-CREATE: Creating new post');
      this.postsService.addPost(
        this.postForm.value.title,
        this.postForm.value.content
      );
    } else if (this.postToEdit?.id) {
      console.log('POST-CREATE: Updating post with id:', this.postToEdit.id);
      this.postsService.updatePost(
        this.postToEdit.id,
        this.postForm.value.title,
        this.postForm.value.content
      );
      this.mode = 'create';
      this.postToEdit = null;
    }
    this.postForm.reset();
  }
}
