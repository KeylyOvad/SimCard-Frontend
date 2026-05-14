import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Header } from '../../../shared/header/header';
import { FilterPipe } from '../../../shared/pipes/fiter.pipe'; 

@Component({
  selector: 'app-planes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Header, FilterPipe],
  templateUrl: './planes.html',
  styleUrls: ['./planes.css']
})
export class Planes implements OnInit {
  searchText = '';
  modalAbierto = false;
  planes: any[] = [];
  planEditando: any = null;
  nuevoPlan = {
    descripcion: ''
  };
  constructor(
    private http: HttpClient,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
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
    this.modalAbierto = true;
    this.nuevoPlan = { descripcion: '' };
    this.planEditando = null;
  }
  cerrarModal() {
    this.modalAbierto = false;
    this.resetForm();
  }
  editarPlan(plan: any) {
    this.planEditando = plan;
    this.nuevoPlan = { descripcion: plan.descripcion };
    this.modalAbierto = true;
  }
  eliminarPlan(id: number) {
    const confirmar = confirm(`¿Eliminar plan con ID ${id}?`);
    if (!confirmar) return;
    this.http.delete(`http://localhost:3000/api/planes/${id}`)
      .subscribe({
        next: () => this.cargarPlanes(),
        error: (err) => {
          console.error(err);
          alert('Error al eliminar plan');
        }
      });
  }
  guardarPlan() {
    if (!this.nuevoPlan.descripcion) {
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
          error: () => alert('Error al crear plan')
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
        error: () => alert('Error al actualizar plan')
      });
    }
  }
  resetForm() {
    this.nuevoPlan = { descripcion: '' };
    this.planEditando = null;
  }

}