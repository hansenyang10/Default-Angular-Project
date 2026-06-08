import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilderDropdownComponent } from './filter-dropdown.component';

describe('FilderDropdownComponent', () => {
  let component: FilderDropdownComponent;
  let fixture: ComponentFixture<FilderDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilderDropdownComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilderDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
