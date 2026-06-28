import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleObjeto } from './detalle-objeto';

describe('DetalleObjeto', () => {
  let component: DetalleObjeto;
  let fixture: ComponentFixture<DetalleObjeto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleObjeto],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleObjeto);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
