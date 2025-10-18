import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardCommentComponent } from './dashboard-comment.component';

describe('DashboardCommentComponent', () => {
  let component: DashboardCommentComponent;
  let fixture: ComponentFixture<DashboardCommentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardCommentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardCommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
