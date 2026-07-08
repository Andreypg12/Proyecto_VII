import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CitaDetail } from './cita-detail';

describe('CitaDetail', () => {
  let component: CitaDetail;
  let fixture: ComponentFixture<CitaDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CitaDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(CitaDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
