import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SeleccionarProyectoModalComponent } from './seleccionar-proyecto-modal.component';

describe('SeleccionarProyectoModalComponent', () => {
  let component: SeleccionarProyectoModalComponent;
  let fixture: ComponentFixture<SeleccionarProyectoModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SeleccionarProyectoModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SeleccionarProyectoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
