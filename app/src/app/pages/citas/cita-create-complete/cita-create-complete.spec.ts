import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CitaCreateComplete } from './cita-create-complete';

describe('CitaCreateComplete', () => {
  let component: CitaCreateComplete;
  let fixture: ComponentFixture<CitaCreateComplete>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CitaCreateComplete],
    }).compileComponents();

    fixture = TestBed.createComponent(CitaCreateComplete);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
