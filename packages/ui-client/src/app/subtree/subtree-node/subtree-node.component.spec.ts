import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubtreeNodeComponent } from './subtree-node.component';

describe('SubtreeNodeComponent', () => {
  let component: SubtreeNodeComponent;
  let fixture: ComponentFixture<SubtreeNodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubtreeNodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubtreeNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
