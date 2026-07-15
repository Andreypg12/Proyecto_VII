import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CitasList } from './citas-list';

describe('CitasList', () => {
  let component: CitasList;
  let fixture: ComponentFixture<CitasList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CitasList],
    }).compileComponents();

    fixture = TestBed.createComponent(CitasList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
