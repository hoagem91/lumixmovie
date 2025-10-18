import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromptMessageComponent } from './prompt-message.component';

describe('PromtMessageComponent', () => {
  let component: PromptMessageComponent;
  let fixture: ComponentFixture<PromptMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PromptMessageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromptMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
