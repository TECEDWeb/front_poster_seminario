import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ConcursoService } from '../../../core/services/concurso.service';
import { Concurso } from '../../../core/models/concurso.model';

@Component({
  selector: 'app-concurso-form-modal',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  templateUrl: './concurso-form-modal.component.html',
  styleUrls: ['./concurso-form-modal.component.scss']
})
export class ConcursoFormModalComponent {

  @Input() concurso?: Concurso;

  private fb = inject(FormBuilder);
  private modalCtrl = inject(ModalController);
  private concursoService = inject(ConcursoService);

  editando = false;

  form = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: ['', Validators.required],
    fechaInicio: ['', Validators.required],
    fechaFin: ['', Validators.required],
    estado: [true]
  });

  ngOnInit() {
    if (this.concurso) {
      this.editando = true;
      this.form.patchValue(this.concurso);
    }
  }

  cerrar() {
    this.modalCtrl.dismiss();
  }

  guardar() {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const data = this.form.value as Concurso;

    const request = this.editando
      ? this.concursoService.actualizar(this.concurso!.id, data)
      : this.concursoService.crear(data);

    request.subscribe(res => this.modalCtrl.dismiss(res));
  }
}