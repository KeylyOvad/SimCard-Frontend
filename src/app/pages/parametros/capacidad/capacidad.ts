import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Header } from '../../../shared/header/header';
import { FilterPipe } from '../../../shared/pipes/fiter.pipe';

@Component({
 selector: 'app-capacidad',
 standalone: true,
 imports: [CommonModule, FormsModule, RouterModule, Header, FilterPipe],
 templateUrl: './capacidad.html',
 styleUrls: ['./capacidad.css']
})

export class Capacidad implements OnInit {
   searchText = '';
   modalAbierto = false;
   capacidades: any[] = [];
   capacidadEditando: any = null;
  nuevaCapacidad = { descripcion: '' };
  
  constructor(private http: HttpClient, private cd: ChangeDetectorRef) {}
    ngOnInit() {
    this.cargarCapacidades();
}

cargarCapacidades() {
   this.http.get<any[]>('http://localhost:3000/api/capacidad')
       .subscribe({
        next: (data) => {
        this.capacidades = data;
        this.cd.detectChanges();
    },
       error: (err) => console.error('Error al cargar capacidades:', err)
    });
 }

 abrirModal() {
    this.modalAbierto = true;
    this.nuevaCapacidad = { descripcion: '' };
    this.capacidadEditando = null;
}

   cerrarModal() {
   this.modalAbierto = false;
   this.resetForm();
 }

  editarCapacidad(cap: any) {
    this.capacidadEditando = cap;
    this.nuevaCapacidad = { descripcion: cap.descripcion };
    this.modalAbierto = true;
 }

 eliminarCapacidad(id: number) {
    if (!confirm(`¿Eliminar capacidad con ID ${id}?`)) return;
    this.http.delete(`http://localhost:3000/api/capacidad/${id}`)
      .subscribe({
      next: () => this.cargarCapacidades(),
      error: (err) => alert('Error al eliminar capacidad')
    });
 }

  guardarCapacidad() {
      if (!this.nuevaCapacidad.descripcion) {
      alert('Completa la descripción');
      return;
 }

  if (!this.capacidadEditando) {
        this.http.post('http://localhost:3000/api/capacidad', this.nuevaCapacidad)
       .subscribe({
        next: () => { this.cargarCapacidades(); this.cerrarModal(); },
        error: () => alert('Error al crear capacidad')
  });

    } else {
        this.http.put(
       `http://localhost:3000/api/capacidad/${this.capacidadEditando.id_capacidad}`,
        this.nuevaCapacidad
    ).subscribe({
        next: () => { this.cargarCapacidades(); this.cerrarModal(); },
        error: () => alert('Error al actualizar capacidad')
      });
   }
 }
 resetForm() {
    this.nuevaCapacidad = { descripcion: '' };
    this.capacidadEditando = null;
  }
}