import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Responsables } from './responsables';

describe('Responsables', () => {
  let component: Responsables;
  let fixture: ComponentFixture<Responsables>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Responsables],
    }).compileComponents();

    fixture = TestBed.createComponent(Responsables);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
