import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Carros } from './carros';

describe('Carros', () => {
  let component: Carros;
  let fixture: ComponentFixture<Carros>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Carros],
    }).compileComponents();

    fixture = TestBed.createComponent(Carros);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
