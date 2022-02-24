import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectColorFilterComponent } from './select-color-filter.component';

describe('SelectColorFilterComponent', () => {
  let component: SelectColorFilterComponent;
  let fixture: ComponentFixture<SelectColorFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectColorFilterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectColorFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
