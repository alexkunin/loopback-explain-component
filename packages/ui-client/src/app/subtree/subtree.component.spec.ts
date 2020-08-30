import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubtreeComponent } from './subtree.component';

describe('SubtreeComponent', () => {
  let component: SubtreeComponent;
  let fixture: ComponentFixture<SubtreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubtreeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubtreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
