import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Header } from '../../../shared/header/header';
import { FilterPipe } from '../../../shared/pipes/fiter.pipe';

@Component({
  selector: 'app-estado',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Header, FilterPipe],
  templateUrl: './estados.html',
  styleUrls: ['./estados.css']
})
export class Estado implements OnInit {
  searchText = '';
  modalAbierto = false;
  estados: any[] = [];
  estadoEditando: any = null;
  nuevoEstado = { descripcion: '' };
  constructor(private http: HttpClient, private cd: ChangeDetectorRef) {}
  ngOnInit() {
    this.cargarEstados();
  }

  cargarEstados() {
    this.http.get<any[]>('http://localhost:3000/api/estados')
      .subscribe({
        next: (data) => {
          this.estados = data;
          this.cd.detectChanges();
        },
        error: (err) => console.error('Error al cargar estados:', err)
      });
  }

  abrirModal() {
    this.modalAbierto = true;
    this.nuevoEstado = { descripcion: '' };
    this.estadoEditando = null;
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.resetForm();
  }
  editarEstado(est: any) {
    this.estadoEditando = est;
    this.nuevoEstado = { descripcion: est.descripcion };
    this.modalAbierto = true;
  }
  eliminarEstado(id: number) {
    if (!confirm(`¿Eliminar estado con ID ${id}?`)) return;
    this.http.delete(`http://localhost:3000/api/estados/${id}`)
       .subscribe({
        next: () => this.cargarEstados(),
        error: (err) => alert('Error al eliminar estado')
     });
    }
   guardarEstado() {
        if (!this.nuevoEstado.descripcion) {
        alert('Completa la descripción');
    return;
     }
       if (!this.estadoEditando) {
         this.http.post('http://localhost:3000/api/estados', this.nuevoEstado)
          .subscribe({
           next: () => { this.cargarEstados(); this.cerrarModal(); },
           error: () => alert('Error al crear estado')
       });
   } else {
       this.http.put(
      `http://localhost:3000/api/estados/${this.estadoEditando.id_estado}`,
       this.nuevoEstado
       ).subscribe({
        next: () => { this.cargarEstados(); this.cerrarModal(); },
        error: () => alert('Error al actualizar estado')
     });
   }
  }
  resetForm() {
    this.nuevoEstado = { descripcion: '' };
    this.estadoEditando = null;
  }
}
