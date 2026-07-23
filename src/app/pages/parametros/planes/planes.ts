import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Header } from '../../../shared/header/header';
import { AuthService } from '../../../services/auth.service';

// Importaciones de PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

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
  modalAbierto = false;
  planes: any[] = [];
  planEditando: any = null;
  puedeModificar: boolean = false;

  nuevoPlan = {
    descripcion: ''
  };

  constructor(
    private http: HttpClient,
    private authService: AuthService, 
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.puedeModificar = this.authService.esAdmin();
    console.log('¿Este usuario tiene permisos en la sección de planes?:', this.puedeModificar);
    this.cargarPlanes();
  }

  cargarPlanes() {
    this.http.get<any[]>('http://localhost:3000/api/planes')
      .subscribe({
        next: (data) => {
          this.planes = data;
          this.cd.detectChanges();
        },
        error: (err) => {
          console.error('Error al cargar planes:', err);
        }
      });
  }

  abrirModal() {
    if (!this.puedeModificar) return; 
    this.modalAbierto = true;
    this.nuevoPlan = { descripcion: '' };
    this.planEditando = null;
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.resetForm();
  }

  editarPlan(plan: any) {
    if (!this.puedeModificar) return; 
    this.planEditando = plan;
    this.nuevoPlan = { descripcion: plan.descripcion };
    this.modalAbierto = true;
  }

  eliminarPlan(plan: any) {
    if (!this.puedeModificar) return; 
    const confirmar = confirm(`¿Eliminar el plan: ${plan.descripcion}?`);
    if (!confirmar) return;

    this.http.delete(`http://localhost:3000/api/planes/${plan.id_plan}`)
      .subscribe({
        next: () => {
          this.cargarPlanes();
        },
        error: (err) => {
          console.error(err);
          const msg = err.error && err.error.message ? err.error.message : 'Error al eliminar plan';
          alert(msg);
        }
      });
  }

  guardarPlan() {
    if (!this.puedeModificar) return; 
    if (!this.nuevoPlan.descripcion.trim()) {
      alert('Completa la descripción');
      return;
    }

    if (!this.planEditando) {
      this.http.post('http://localhost:3000/api/planes', this.nuevoPlan)
        .subscribe({
          next: () => {
            this.cargarPlanes();
            this.cerrarModal();
          },
          error: (err) => {
            console.error(err);
            const msg = err.error && err.error.message ? err.error.message : 'Error al crear plan';
            alert(msg);
          }
        });
    } else {
      this.http.put(
        `http://localhost:3000/api/planes/${this.planEditando.id_plan}`,
        this.nuevoPlan
      ).subscribe({
        next: () => {
          this.cargarPlanes();
          this.cerrarModal();
        },
        error: (err) => {
          console.error(err);
          const msg = err.error && err.error.message ? err.error.message : 'Error al actualizar plan';
          alert(msg);
        }
      });
    }
  }

  resetForm() {
    this.nuevoPlan = { descripcion: '' };
    this.planEditando = null;
  }
}