import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Header } from '../../../shared/header/header';
import { AuthService } from '../../../services/auth.service';
import { enviroment } from '../../../../environments/environment';

// Modulos de PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

// Estructura de datos para un plan
export interface PlanItem {
  id_plan?: number;
  descripcion: string;
}

@Component({
  selector: 'app-planes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    Header,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    IconFieldModule,
    InputIconModule
  ],
  templateUrl: './planes.html',
  styleUrls: ['./planes.css']
})
export class Planes implements OnInit {

  // Ruta base de la API
  private readonly apiUrl = `${enviroment.api}/planes`;

  // Variables de control y datos
  modalAbierto = false;
  planes: PlanItem[] = [];
  planEditando: PlanItem | null = null;
  puedeModificar = false;

  // Objeto para el formulario
  nuevoPlan: PlanItem = {
    descripcion: ''
  };

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.puedeModificar = this.authService.esAdmin();
    this.cargarPlanes();
  }

  // Trae la lista de planes desde la API
  cargarPlanes() {
    this.http.get<PlanItem[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.planes = data;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar planes:', err);
      }
    });
  }

  // Abre el modal para crear un nuevo plan
  abrirModal() {
    if (!this.puedeModificar) return;

    this.resetForm();
    this.modalAbierto = true;
  }

  // Cierra el modal y limpia el formulario
  cerrarModal() {
    this.modalAbierto = false;
    this.resetForm();
  }

  // Carga los datos en el modal para editar
  editarPlan(plan: PlanItem) {
    if (!this.puedeModificar) return;

    this.planEditando = plan;
    this.nuevoPlan = {
      descripcion: plan.descripcion
    };

    this.modalAbierto = true;
  }

  // Elimina un plan
  eliminarPlan(plan: PlanItem) {
    if (!this.puedeModificar || !plan.id_plan) return;

    if (!confirm(`¿Eliminar el plan: ${plan.descripcion}?`)) return;

    this.http.delete(`${this.apiUrl}/${plan.id_plan}`).subscribe({
      next: () => this.cargarPlanes(),
      error: (err) => {
        console.error(err);
        const msg = err.error?.message || 'Error al eliminar plan';
        alert(msg);
      }
    });
  }

  // Guarda o actualiza un plan
  guardarPlan() {
    if (!this.puedeModificar) return;

    const descLimpia = this.nuevoPlan.descripcion.trim();

    if (!descLimpia) {
      alert('Completa la descripción');
      return;
    }

    const payload = {
      descripcion: descLimpia
    };

    if (!this.planEditando) {

      this.http.post(this.apiUrl, payload).subscribe({
        next: () => {
          this.cargarPlanes();
          this.cerrarModal();
        },
        error: (err) => {
          console.error(err);
          const msg = err.error?.message || 'Error al crear plan';
          alert(msg);
        }
      });

    } else {

      const id = this.planEditando.id_plan;

      this.http.put(`${this.apiUrl}/${id}`, payload).subscribe({
        next: () => {
          this.cargarPlanes();
          this.cerrarModal();
        },
        error: (err) => {
          console.error(err);
          const msg = err.error?.message || 'Error al actualizar plan';
          alert(msg);
        }
      });

    }
  }

  // Limpia los datos del formulario
  resetForm() {
    this.nuevoPlan = {
      descripcion: ''
    };

    this.planEditando = null;
  }
}