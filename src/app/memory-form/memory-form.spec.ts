import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemoryForm } from './memory-form';

describe('MemoryForm', () => {
  let component: MemoryForm;
  let fixture: ComponentFixture<MemoryForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemoryForm],
    }).compileComponents();

    fixture = TestBed.createComponent(MemoryForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
