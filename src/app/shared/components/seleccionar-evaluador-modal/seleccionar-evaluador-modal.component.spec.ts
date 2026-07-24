import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SeleccionarEvaluadorModalComponent } from './seleccionar-evaluador-modal.component';

describe('SeleccionarEvaluadorModalComponent', () => {
  let component: SeleccionarEvaluadorModalComponent;
  let fixture: ComponentFixture<SeleccionarEvaluadorModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SeleccionarEvaluadorModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SeleccionarEvaluadorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
