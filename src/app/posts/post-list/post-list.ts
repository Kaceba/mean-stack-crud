import { Component } from '@angular/core';
import { 
  MatAccordion, 
  MatExpansionPanel,
  MatExpansionPanelHeader
} from "@angular/material/expansion";

@Component({
  selector: 'app-post-list',
  imports: [MatAccordion, MatExpansionPanel, MatExpansionPanelHeader],
  templateUrl: './post-list.html',
  styleUrl: './post-list.css'
})
export class PostList {

}
