import { Component } from '@angular/core';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelHeader
} from "@angular/material/expansion";
import { Post } from '../post.model';

@Component({
  selector: 'app-post-list',
  imports: [MatAccordion, MatExpansionPanel, MatExpansionPanelHeader],
  templateUrl: './post-list.html',
  styleUrls: ['./post-list.css']
})
export class PostList {
  posts: Post[] = [];
}
