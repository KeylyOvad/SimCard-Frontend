import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Estado} from './estados';

describe('Estados', () => {
  let component: Estado;
  let fixture: ComponentFixture<Estado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Estado],
    }).compileComponents();

    fixture = TestBed.createComponent(Estado);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
