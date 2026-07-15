import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfesionalDetail } from './profesional-detail';

describe('ProfesionalDetail', () => {
  let component: ProfesionalDetail;
  let fixture: ComponentFixture<ProfesionalDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfesionalDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfesionalDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
