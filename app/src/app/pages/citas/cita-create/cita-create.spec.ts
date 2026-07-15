import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CitaCreate } from './cita-create';

describe('CitaCreate', () => {
  let component: CitaCreate;
  let fixture: ComponentFixture<CitaCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CitaCreate],
    }).compileComponents();

    fixture = TestBed.createComponent(CitaCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
