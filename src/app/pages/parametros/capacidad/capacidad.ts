import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Header } from '../../../shared/header/header';
import { AuthService } from '../../../services/auth.service';
import { enviroment } from '../../../../environments/environment';

// Modulos PrimeNG
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

@Component({
  selector: 'app-capacidad',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Header,
    TableModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule
  ],
  templateUrl: './capacidad.html',
  styleUrls: ['./capacidad.css']
})
export class Capacidad implements OnInit {

  private apiUrl = `${enviroment.api}/capacidad`;

  modalAbierto = false;
  capacidades: any[] = [];
  capacidadEditando: any = null;
  puedeModificar = false;

  nuevaCapacidad = {
    descripcion: ''
  };

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.puedeModificar = this.authService.esAdmin();
    this.cargarCapacidades();
  }

  cargarCapacidades() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.capacidades = data;
        this.cd.detectChanges();
      },
      error: (err) => console.error('Error al cargar capacidades:', err)
    });
  }

  abrirModal() {
    if (!this.puedeModificar) return;
    this.resetForm();
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.resetForm();
  }

  editarCapacidad(capacidad: any) {
    if (!this.puedeModificar) return;

    this.capacidadEditando = capacidad;
    this.nuevaCapacidad = {
      descripcion: capacidad.descripcion
    };

    this.modalAbierto = true;
  }

  eliminarCapacidad(capacidad: any) {
    if (!this.puedeModificar) return;

    if (!confirm(`¿Eliminar la capacidad ${capacidad.descripcion}?`)) return;

    this.http.delete(`${this.apiUrl}/${capacidad.id_capacidad}`).subscribe({
      next: () => this.cargarCapacidades(),
      error: (err) =>
        alert(err.error?.message || 'Error al eliminar capacidad')
    });
  }

  guardarCapacidad() {
    if (!this.puedeModificar) return;

    if (!this.nuevaCapacidad.descripcion.trim()) {
      alert('Completa la descripción');
      return;
    }

    const payload = {
      descripcion: this.nuevaCapacidad.descripcion
    };

    if (!this.capacidadEditando) {
      this.http.post(this.apiUrl, payload).subscribe({
        next: () => {
          this.cargarCapacidades();
          this.cerrarModal();
        },
        error: (err) =>
          alert(err.error?.message || 'Fallo al crear capacidad.')
      });
    } else {
      this.http.put(
        `${this.apiUrl}/${this.capacidadEditando.id_capacidad}`,
        payload
      ).subscribe({
        next: () => {
          this.cargarCapacidades();
          this.cerrarModal();
        },
        error: (err) =>
          alert(err.error?.message || 'Fallo al actualizar capacidad.')
      });
    }
  }

  resetForm() {
    this.nuevaCapacidad = {
      descripcion: ''
    };

    this.capacidadEditando = null;
  }
}