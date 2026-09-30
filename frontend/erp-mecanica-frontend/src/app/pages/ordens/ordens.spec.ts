import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Ordens } from './ordens';

describe('Ordens', () => {
  let component: Ordens;
  let fixture: ComponentFixture<Ordens>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ordens],
    }).compileComponents();

    fixture = TestBed.createComponent(Ordens);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
