import {DOCUMENT} from '@angular/common';
import {Component, Inject, Input, OnInit} from '@angular/core';
import {ApiService, Node} from 'src/app/api.service';

@Component({
  selector: 'app-subtree-node',
  templateUrl: './subtree-node.component.html',
  styleUrls: ['./subtree-node.component.scss'],
})
export class SubtreeNodeComponent implements OnInit {
  @Input() data?: Node;
  @Input() selector?: string | null = null;

  @Input() set collapsed(value: boolean) {
    this.document.defaultView.localStorage.setItem(this.selector, value ? null : 'f');
  }

  get collapsed(): boolean {
    if (typeof this.selector === 'string') {
      return this.document.defaultView.localStorage.getItem(this.selector) !== 'f';
    } else {
      return true;
    }
  }

  constructor(
    private readonly apiService: ApiService,
    @Inject(DOCUMENT) private readonly document: Document,
  ) {
  }

  ngOnInit(): void {
  }

  load(): void {
    this.collapsed = false;
    this.apiService.loadSubtree(this.selector).subscribe(subtree => this.data = subtree);
  }
}
