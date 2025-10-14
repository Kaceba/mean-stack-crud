import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { PostsService } from '../posts.service';

@Component({
  selector: 'app-post-create',
  imports: [ReactiveFormsModule, MatInputModule, MatFormFieldModule, MatButtonModule],
  templateUrl: './post-create.html',
  styleUrl: './post-create.css'
})
export class PostCreate implements OnInit {
  postForm!: FormGroup;

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

  onAddPost() {
    if (this.postForm.invalid) {
      return;
    }
    this.postsService.addPost(
      this.postForm.value.title,
      this.postForm.value.content
    );
    this.postForm.reset();
  }
}
