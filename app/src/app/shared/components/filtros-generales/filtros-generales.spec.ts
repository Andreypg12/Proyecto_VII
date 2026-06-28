import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltrosGenerales } from './filtros-generales';

describe('FiltrosGenerales', () => {
  let component: FiltrosGenerales;
  let fixture: ComponentFixture<FiltrosGenerales>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiltrosGenerales],
    }).compileComponents();

    fixture = TestBed.createComponent(FiltrosGenerales);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
