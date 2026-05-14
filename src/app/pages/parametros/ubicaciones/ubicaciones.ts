import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Header } from '../../../shared/header/header';
import { FilterPipe } from '../../../shared/pipes/fiter.pipe';

@Component({
  selector: 'app-ubicacion',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Header, FilterPipe],
  templateUrl: './ubicaciones.html',
  styleUrls: ['./ubicaciones.css']
})
export class Ubicaciones implements OnInit {
  searchText = '';
  modalAbierto = false;
  ubicaciones: any[] = [];
  ubicacionEditando: any = null;
  nuevaUbicacion = { descripcion: '' };

  constructor(private http: HttpClient, private cd: ChangeDetectorRef) {}
  ngOnInit() {
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
    this.modalAbierto = true;
    this.nuevaUbicacion = { descripcion: '' };
    this.ubicacionEditando = null;
  }
  cerrarModal() {
    this.modalAbierto = false;
    this.resetForm();
  }
  editarUbicacion(ubi: any) {
    this.ubicacionEditando = ubi;
    this.nuevaUbicacion = { descripcion: ubi.descripcion };
    this.modalAbierto = true;
  }
  eliminarUbicacion(id: number) {
    if (!confirm(`¿Eliminar ubicación con ID ${id}?`)) return;
    this.http.delete(`http://localhost:3000/api/ubicaciones/${id}`)
      .subscribe({
        next: () => this.cargarUbicaciones(),
        error: (err) => alert('Error al eliminar ubicación')
      });
  }
  guardarUbicacion() {
    if (!this.nuevaUbicacion.descripcion) {
      alert('Completa la descripción');
      return;
    }
    if (!this.ubicacionEditando) {
      this.http.post('http://localhost:3000/api/ubicaciones', this.nuevaUbicacion)
        .subscribe({
          next: () => { this.cargarUbicaciones(); this.cerrarModal(); },
          error: () => alert('Error al crear ubicación')
        });
    } else {
      this.http.put(
        `http://localhost:3000/api/ubicaciones/${this.ubicacionEditando.id_ubicacion}`,
        this.nuevaUbicacion
      ).subscribe({
        next: () => { this.cargarUbicaciones(); this.cerrarModal(); },
        error: () => alert('Error al actualizar ubicación')
      });
    }
  }
  resetForm() {
    this.nuevaUbicacion = { descripcion: '' };
    this.ubicacionEditando = null;
  }
}
