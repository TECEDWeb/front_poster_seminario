import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle,
  IonContent, IonButton, IonIcon, IonSearchbar, IonSelect, IonSelectOption,
  IonSkeletonText
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline, downloadOutline, trashOutline, ribbonOutline,
  refreshOutline, searchOutline, alertCircleOutline
} from 'ionicons/icons';

import { CertificadoService } from '../../../../core/services/certificado.service';
import { Certificado } from '../../../../core/models/certificado.model';

@Component({
  selector: 'app-gestion-certificados',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle,
    IonContent, IonButton, IonIcon, IonSearchbar, IonSelect, IonSelectOption,
    IonSkeletonText
  ],
  templateUrl: './gestion-certificados.page.html',
  styleUrls: ['./gestion-certificados.page.scss']
})
export class GestionCertificadosPage implements OnInit {

  certificados: Certificado[] = [];
  filtrados: Certificado[] = [];
  cargando = true;
  error: string | null = null;

  filtroBusqueda = '';
  filtroTipo = 'todos';

  constructor(private certificadoService: CertificadoService) {
    addIcons({
      addOutline, downloadOutline, trashOutline, ribbonOutline,
      refreshOutline, searchOutline, alertCircleOutline
    });
  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.error = null;

    this.certificadoService.listar().subscribe({
      next: (data) => {
        this.certificados = data;
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: (err) => {
        this.error = err.error?.mensaje || 'Error al cargar los certificados';
        this.certificados = [];
        this.filtrados = [];
        this.cargando = false;
      }
    });
  }

  aplicarFiltros(): void {
    let filtered = [...this.certificados];

    if (this.filtroBusqueda.trim()) {
      const texto = this.filtroBusqueda.toLowerCase().trim();
      filtered = filtered.filter(c =>
        c.nombre.toLowerCase().includes(texto) ||
        c.codigo.toLowerCase().includes(texto) ||
        c.cedula.includes(texto)
      );
    }

    if (this.filtroTipo !== 'todos') {
      filtered = filtered.filter(c => c.tipoCertificado === this.filtroTipo);
    }

    this.filtrados = filtered;
  }

  limpiarFiltros(): void {
    this.filtroBusqueda = '';
    this.filtroTipo = 'todos';
    this.aplicarFiltros();
  }

  recargar(): void {
    this.cargar();
  }

  descargar(certificado: Certificado): void {
    this.certificadoService.descargarPdf(certificado.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `certificado-${certificado.codigo}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: () => alert('Error al descargar el certificado')
    });
  }

  eliminar(certificado: Certificado): void {
    if (!confirm(`¿Eliminar el certificado de "${certificado.nombre}" (${certificado.codigo})? Esta acción no se puede deshacer.`)) return;

    this.certificadoService.eliminar(certificado.id).subscribe({
      next: () => {
        this.certificados = this.certificados.filter(c => c.id !== certificado.id);
        this.aplicarFiltros();
      },
      error: (err) => alert(err.error?.mensaje || 'Error al eliminar el certificado')
    });
  }

  get tiposUnicos(): string[] {
    return Array.from(new Set(this.certificados.map(c => c.tipoCertificado)));
  }

  trackById(index: number, item: Certificado): number {
    return item?.id ?? index;
  }
}