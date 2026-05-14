import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Header } from '../../../shared/header/header';
import { FilterPipe } from '../../../shared/pipes/fiter.pipe';

@Component({
  selector: 'app-responsable',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Header, FilterPipe],
  templateUrl: './responsables.html',
  styleUrls: ['./responsables.css']
})

export class Responsables implements OnInit {
  searchText = '';
  modalAbierto = false;
  responsables: any[] = [];
  responsableEditando: any = null;
  nuevoResponsable = { descripcion: '' };

  constructor(private http: HttpClient, private cd: ChangeDetectorRef) {}
  ngOnInit() {
    this.cargarResponsables();
  }
  cargarResponsables() {
    this.http.get<any[]>('http://localhost:3000/api/responsables')
      .subscribe({
        next: (data) => {
          this.responsables = data;
          this.cd.detectChanges();
        },
        error: (err) => console.error('Error al cargar responsables:', err)
      });
  }
  abrirModal() {
    this.modalAbierto = true;
    this.nuevoResponsable = { descripcion: '' };
    this.responsableEditando = null;
  }
  cerrarModal() {
    this.modalAbierto = false;
    this.resetForm();
  }
  editarResponsable(resp: any) {
    this.responsableEditando = resp;
    this.nuevoResponsable = { descripcion: resp.descripcion };
    this.modalAbierto = true;
  }
  eliminarResponsable(id: number) {
    if (!confirm(`¿Eliminar responsable con ID ${id}?`)) return;
    this.http.delete(`http://localhost:3000/api/responsables/${id}`)
      .subscribe({
        next: () => this.cargarResponsables(),
        error: (err) => alert('Error al eliminar responsable')
      });
  }
  guardarResponsable() {
    if (!this.nuevoResponsable.descripcion) {
      alert('Completa la descripción');
      return;
    }
    if (!this.responsableEditando) {
      this.http.post('http://localhost:3000/api/responsables', this.nuevoResponsable)
        .subscribe({
          next: () => { this.cargarResponsables(); this.cerrarModal(); },
          error: () => alert('Error al crear responsable')
        });
    } else {
      this.http.put(
        `http://localhost:3000/api/responsables/${this.responsableEditando.id_responsable}`,
        this.nuevoResponsable
      ).subscribe({
        next: () => { this.cargarResponsables(); this.cerrarModal(); },
        error: () => alert('Error al actualizar responsable')
      });
    }
  }
  resetForm() {
    this.nuevoResponsable = { descripcion: '' };
    this.responsableEditando = null;
  }
}
