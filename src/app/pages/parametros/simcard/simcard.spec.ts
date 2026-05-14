import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipoSim } from './simcard';

describe('Simcard', () => {
  let component: TipoSim;
  let fixture: ComponentFixture<TipoSim>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TipoSim],
    }).compileComponents();

    fixture = TestBed.createComponent(TipoSim);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
