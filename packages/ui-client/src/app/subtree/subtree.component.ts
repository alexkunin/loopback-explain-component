import {Component, Input, OnInit} from '@angular/core';
import {Node} from '../api.service';

@Component({
  selector: 'app-subtree',
  templateUrl: './subtree.component.html',
  styleUrls: ['./subtree.component.scss'],
})
export class SubtreeComponent implements OnInit {
  @Input() data?: Node;
  @Input() selector?: string | null = null;

  constructor() {
  }

  ngOnInit(): void {
  }

}
