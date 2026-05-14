import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Capacidad } from './capacidad';

describe('Capacidad', () => {
  let component: Capacidad;
  let fixture: ComponentFixture<Capacidad>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Capacidad],
    }).compileComponents();

    fixture = TestBed.createComponent(Capacidad);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
