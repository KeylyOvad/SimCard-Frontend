import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimForm } from './sim-form';

describe('SimForm', () => {
  let component: SimForm;
  let fixture: ComponentFixture<SimForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimForm],
    }).compileComponents();

    fixture = TestBed.createComponent(SimForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
