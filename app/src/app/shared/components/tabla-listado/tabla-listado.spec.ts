import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablaListado } from './tabla-listado';

describe('TablaListado', () => {
  let component: TablaListado;
  let fixture: ComponentFixture<TablaListado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TablaListado],
    }).compileComponents();

    fixture = TestBed.createComponent(TablaListado);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
