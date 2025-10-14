import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelHeader
} from "@angular/material/expansion";
import { Post } from '../post.model';
import { PostsService } from '../posts.service';

@Component({
  selector: 'app-post-list',
  imports: [MatAccordion, MatExpansionPanel, MatExpansionPanelHeader],
  templateUrl: './post-list.html',
  styleUrls: ['./post-list.css']
})
export class PostList implements OnInit, OnDestroy {
  posts: Post[] = [];
  private postsSub!: Subscription;

  constructor(private postsService: PostsService) {}

  ngOnInit() {
    this.posts = this.postsService.getPosts();
    this.postsSub = this.postsService.getPostUpdateListener()
      .subscribe((posts: Post[]) => {
        this.posts = posts;
      });
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
  }
}
