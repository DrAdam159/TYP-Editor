import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconDescriptionsComponent } from './icon-descriptions.component';

describe('IconDescriptionsComponent', () => {
  let component: IconDescriptionsComponent;
  let fixture: ComponentFixture<IconDescriptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IconDescriptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IconDescriptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
