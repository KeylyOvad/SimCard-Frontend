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
  selector: 'app-ubicacion',
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
  templateUrl: './ubicaciones.html',
  styleUrls: ['./ubicaciones.css']
})
export class Ubicaciones implements OnInit {
  modalAbierto = false;
  ubicaciones: any[] = [];
  ubicacionEditando: any = null;

  puedeModificar: boolean = false;

  nuevaUbicacion = { descripcion: '' };

  constructor(
    private http: HttpClient, 
    private authService: AuthService, 
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.puedeModificar = this.authService.esAdmin();
    console.log('¿Este usuario tiene permisos en la sección de ubicaciones?:', this.puedeModificar);
    this.cargarUbicaciones();
  }

  cargarUbicaciones() {
    this.http.get<any[]>('http://localhost:3000/api/ubicaciones')
      .subscribe({
        next: (data) => {
          this.ubicaciones = data;
          this.cd.detectChanges();
        },
        error: (err) => console.error('Error al cargar ubicaciones:', err)
      });
  }

  abrirModal() {
    if (!this.puedeModificar) return; 
    this.modalAbierto = true;
    this.nuevaUbicacion = { descripcion: '' };
    this.ubicacionEditando = null;
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.resetForm();
  }

  editarUbicacion(ubi: any) {
    if (!this.puedeModificar) return; 
    this.ubicacionEditando = ubi;
    this.nuevaUbicacion = { descripcion: ubi.descripcion };
    this.modalAbierto = true;
  }

  eliminarUbicacion(ubi: any) {
    if (!this.puedeModificar) return; 
    if (!confirm(`¿Eliminar la ubicación: ${ubi.descripcion}?`)) return;

    this.http.delete(`http://localhost:3000/api/ubicaciones/${ubi.id_ubicacion}`)
      .subscribe({
        next: () => {
          this.cargarUbicaciones();
        },
        error: (err) => {
          console.error(err);
          const msg = err.error && err.error.message ? err.error.message : 'Error al eliminar ubicación';
          alert(msg);
        }
      });
  }

  guardarUbicacion() {
    if (!this.puedeModificar) return; 
    if (!this.nuevaUbicacion.descripcion.trim()) {
      alert('Completa la descripción');
      return;
    }

    if (!this.ubicacionEditando) {
      this.http.post('http://localhost:3000/api/ubicaciones', this.nuevaUbicacion)
        .subscribe({
          next: () => { this.cargarUbicaciones(); this.cerrarModal(); },
          error: (err) => {
            console.error(err);
            const msg = err.error && err.error.message ? err.error.message : 'Error al crear ubicación';
            alert(msg);
          }
        });
    } else {
      this.http.put(
        `http://localhost:3000/api/ubicaciones/${this.ubicacionEditando.id_ubicacion}`,
        this.nuevaUbicacion
      ).subscribe({
        next: () => { this.cargarUbicaciones(); this.cerrarModal(); },
        error: (err) => {
          console.error(err);
          const msg = err.error && err.error.message ? err.error.message : 'Error al actualizar ubicación';
          alert(msg);
        }
      });
    }
  }

  resetForm() {
    this.nuevaUbicacion = { descripcion: '' };
    this.ubicacionEditando = null;
  }
}