import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonButton,
  IonIcon,
  IonSkeletonText,
  IonFab,
  IonFabButton,
  IonChip,
  IonLabel,
  IonSpinner,
  IonSearchbar,
  IonInput,        // ← AÑADIR
  IonSelect,       // ← AÑADIR
  IonSelectOption
} from '@ionic/angular/standalone';
import { RubricaService } from '../../../core/services/rubrica.service';
import { RubricaConcurso } from '../../../core/models/rubrica.model';
import { addIcons } from 'ionicons';
import {
  addOutline,
  checkboxOutline,
  createOutline,
  trashOutline,
  eyeOutline,
  layersOutline,
  listOutline,
  checkmarkCircleOutline,
  downloadOutline,
  refreshOutline,
  searchOutline,
  funnelOutline,
  closeOutline,
  alertCircleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-rubricas',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonButton,
    IonIcon,
    IonSkeletonText,
    IonFab,
    IonFabButton,
    IonChip,
    IonLabel,
    IonSpinner,
    IonInput,
    IonSearchbar,
    IonSelect,
    IonSelectOption
  ],
  templateUrl: './rubricas.page.html',
  styleUrls: ['./rubricas.page.scss']
})
export class RubricasPage implements OnInit {

  rubricas: RubricaConcurso[] = [];
  rubricasFiltradas: RubricaConcurso[] = [];
  cargando: boolean = false;
  error: string | null = null;
  totalSecciones: number = 0;
  totalNiveles: number = 0;
  totalCriteriosGlobal: number = 0;

  // Filtros
  filtroBusqueda: string = '';
  filtroSecciones: string = 'todos';

  constructor(private rubricaService: RubricaService) {
    addIcons({
      addOutline,
      checkboxOutline,
      createOutline,
      trashOutline,
      eyeOutline,
      layersOutline,
      listOutline,
      checkmarkCircleOutline,
      downloadOutline,
      refreshOutline,
      searchOutline,
      funnelOutline,
      closeOutline,
      alertCircleOutline
    });
  }

  ngOnInit(): void {
    this.cargarRubricas();
  }

  cargarRubricas(): void {
    this.cargando = true;
    this.error = null;

    this.rubricaService.listar().subscribe({
      next: (res) => {
        console.log('Rúbricas cargadas:', res);
        this.rubricas = res || [];
        this.calcularEstadisticas();
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando rúbricas:', err);
        this.error = err.error?.mensaje || 'Error al cargar las rúbricas';
        this.rubricas = [];
        this.rubricasFiltradas = [];
        this.cargando = false;
      }
    });
  }

  calcularEstadisticas(): void {
    this.totalSecciones = this.rubricas.reduce(
      (total, r) => total + (r.secciones?.length || 0), 0
    );
    this.totalNiveles = this.rubricas.reduce(
      (total, r) => total + (r.niveles?.length || 0), 0
    );
    this.totalCriteriosGlobal = this.rubricas.reduce(
      (total, r) => total + this.totalCriterios(r), 0
    );
  }

  aplicarFiltros(): void {
    let filtered = [...this.rubricas];

    // Filtro por búsqueda (concursoId)
    if (this.filtroBusqueda.trim()) {
      const texto = this.filtroBusqueda.toLowerCase().trim();
      filtered = filtered.filter(r =>
        r.concursoId.toString().includes(texto)
      );
    }

    // Filtro por número de secciones
    if (this.filtroSecciones !== 'todos') {
      const minSecciones = parseInt(this.filtroSecciones);
      filtered = filtered.filter(r => (r.secciones?.length || 0) >= minSecciones);
    }

    this.rubricasFiltradas = filtered;
  }

  totalCriterios(rubrica: RubricaConcurso): number {
    let total = 0;
    if (rubrica.secciones) {
      rubrica.secciones.forEach(s => {
        total += (s.criterios?.length || 0);
      });
    }
    return total;
  }

  recargar(): void {
    this.cargarRubricas();
  }

  limpiarFiltros(): void {
    this.filtroBusqueda = '';
    this.filtroSecciones = 'todos';
    this.aplicarFiltros();
  }

  confirmarEliminar(rubrica: RubricaConcurso): void {
    if (confirm(`¿Estás seguro de eliminar la rúbrica del concurso #${rubrica.concursoId}?`)) {
      this.eliminarRubrica(rubrica.concursoId);
    }
  }

  eliminarRubrica(concursoId: number): void {
    this.rubricaService.eliminar(concursoId).subscribe({
      next: () => {
        this.cargarRubricas();
        alert('Rúbrica eliminada correctamente');
      },
      error: (err) => {
        console.error('Error eliminando rúbrica:', err);
        alert(err.error?.mensaje || 'Error al eliminar la rúbrica');
      }
    });
  }

  exportarRubrica(rubrica: RubricaConcurso): void {
    console.log('Exportando rúbrica:', rubrica);
    // Aquí implementar la exportación real
    alert(`Exportando rúbrica del concurso #${rubrica.concursoId}`);
  }

  verDetalle(rubrica: RubricaConcurso): void {
    console.log('Ver detalle:', rubrica);
    // Aquí navegar a la página de detalle
    // this.router.navigate(['/admin/rubricas', rubrica.concursoId]);
    alert(`Ver detalle de la rúbrica #${rubrica.concursoId}`);
  }

  getStatusClass(seccionesCount: number): string {
    if (seccionesCount >= 3) return 'status-excellent';
    if (seccionesCount >= 2) return 'status-good';
    if (seccionesCount >= 1) return 'status-regular';
    return 'status-low';
  }

  getStatusText(seccionesCount: number): string {
    if (seccionesCount >= 3) return 'Completa';
    if (seccionesCount >= 2) return 'Adecuada';
    if (seccionesCount >= 1) return 'Básica';
    return 'Sin secciones';
  }

  trackById(index: number, item: RubricaConcurso): number {
    return item?.concursoId ?? index;
  }
}