import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Observable, of} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {ApiService, Node, ObjectNode} from 'src/app/api.service';
import stripAnsi from 'strip-ansi';

interface LogEntry {
  format: string;
  args: Node[];
}

@Component({
  selector: 'app-entry-card',
  templateUrl: './entry-card.component.html',
  styleUrls: ['./entry-card.component.scss'],
})
export class EntryCardComponent implements OnInit, OnChanges {
  @Input() data?: Node;
  @Input() selector?: string | null = null;

  logEntries: LogEntry[] = [];

  constructor(private readonly apiService: ApiService) {
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.data) {
      this.extractLogEntries(this.data).subscribe(v => this.logEntries = v);
    }
  }

  private extractLogEntries(data: Node): Observable<LogEntry[]> {
    if (!(data?.$ === 'object' && data?.v.log && data.v.log.$ === 'array')) {
      return of([]);
    }

    const rawEntries = data.v.log.v;

    if (!rawEntries) {
      return this.apiService.loadSubtree((this.selector ? this.selector + '.' : '') + 'log').pipe(
        switchMap(log => {
          (this.data as ObjectNode).v.log = log;
          return this.extractLogEntries(this.data);
        }),
      );
    }

    const makeEntry = (rawEntry: Node): LogEntry => {
      if (rawEntry.$ !== 'array' || rawEntry.v?.length < 1) {
        return null;
      }

      const formatNode = rawEntry.v[0];
      if (formatNode.$ !== 'string') {
        return null;
      }

      const format = stripAnsi(formatNode.v) as string;
      const args = rawEntry.v.slice(1).map(arg => arg?.$ === 'string' ? {...arg, v: stripAnsi(arg.v)} : arg);

      return {format, args};
    };

    return of(rawEntries.map(makeEntry).filter(v => !!v));
  }
}
