import {Component} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {shareReplay, switchMap} from 'rxjs/operators';
import {ApiService} from 'src/app/api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'ui-client';

  private refresh$ = new BehaviorSubject<void>(undefined);

  readonly data$ = this.refresh$.pipe(
    switchMap(() => this.apiService.loadSubtree(null)),
    shareReplay(1),
  );

  constructor(
    readonly apiService: ApiService,
  ) {
  }

  refresh(): void {
    this.refresh$.next();
  }
}
