import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CargarExcelComponent } from './cargar-excel';

describe('CargarExcel', () => {
  let component: CargarExcelComponent;
  let fixture: ComponentFixture<CargarExcelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CargarExcelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CargarExcelComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
