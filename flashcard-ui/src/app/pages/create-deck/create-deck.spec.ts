import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateDeck } from './create-deck';

describe('CreateDeck', () => {
  let component: CreateDeck;
  let fixture: ComponentFixture<CreateDeck>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateDeck],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateDeck);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
