import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Header } from '../../../shared/header/header';
import { FilterPipe } from '../../../shared/pipes/fiter.pipe';

@Component({
  selector: 'app-destino',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Header, FilterPipe],
  templateUrl: './destinos.html',
  styleUrls: ['./destinos.css']
})

export class Destino implements OnInit {
  searchText = '';
  modalAbierto = false;
  destinos: any[] = [];
  destinoEditando: any = null;
  nuevoDestino = { descripcion: '' };

constructor(private http: HttpClient, private cd: ChangeDetectorRef) {}
     ngOnInit() {
     this.cargarDestinos();
 }

  cargarDestinos() {
      this.http.get<any[]>('http://localhost:3000/api/destinos')
      .subscribe({
      next: (data) => {
      this.destinos = data;
      this.cd.detectChanges();
    },
     error: (err) => console.error('Error al cargar destinos:', err)
     });
  }
  abrirModal() {
    this.modalAbierto = true;
    this.nuevoDestino = { descripcion: '' };
    this.destinoEditando = null;
  }

 cerrarModal() {
    this.modalAbierto = false;
    this.resetForm();
  }

  editarDestino(dest: any) {
      this.destinoEditando = dest;
      this.nuevoDestino = { descripcion: dest.descripcion };
      this.modalAbierto = true;
  }
 eliminarDestino(id: number) {
    if (!confirm(`¿Eliminar destino con ID ${id}?`)) return;
    this.http.delete(`http://localhost:3000/api/destinos/${id}`)
    .subscribe({
        next: () => this.cargarDestinos(),
        error: (err) => alert('Error al eliminar destino')
     });
}
   guardarDestino() {
      if (!this.nuevoDestino.descripcion) {
      alert('Completa la descripción');
      return;
   }
     if (!this.destinoEditando) {
     this.http.post('http://localhost:3000/api/destinos', this.nuevoDestino)
     .subscribe({
         next: () => { this.cargarDestinos(); this.cerrarModal(); },
         error: () => alert('Error al crear destino')
       });
     } else {
        this.http.put(
        `http://localhost:3000/api/destinos/${this.destinoEditando.id_destino}`,
         this.nuevoDestino
         ).subscribe({
        next: () => { this.cargarDestinos(); this.cerrarModal(); },
        error: () => alert('Error al actualizar destino')
     });
     }
 }
   resetForm() {
   this.nuevoDestino = { descripcion: '' };
   this.destinoEditando = null;
 }
}