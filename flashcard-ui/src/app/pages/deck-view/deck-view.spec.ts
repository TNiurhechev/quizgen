import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeckView } from './deck-view';

describe('DeckView', () => {
  let component: DeckView;
  let fixture: ComponentFixture<DeckView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeckView],
    }).compileComponents();

    fixture = TestBed.createComponent(DeckView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
