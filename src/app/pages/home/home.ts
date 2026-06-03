import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http'; 

import { SimService } from '../../services/sim.service';
import { Sim } from '../../interceptors/models/sim.model';
import { Header } from '../../shared/header/header';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Header],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class Home implements OnInit {

  simCards: Sim[] = [];
  searchText = '';

  currentPage = 1;
  itemsPerPage = 10;

  stats = {
    total: 0,
    active: 0,
    inactive: 0,
    operators: 0,
  };

  historialSim: any[] = [];
  mostrarModalHistorial: boolean = false;
  simSeleccionadaNumero: string = '';

  constructor(
    private router: Router,
    private simService: SimService,
    private cd: ChangeDetectorRef,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.obtenerSims();
  }

  obtenerSims() {
    this.simService.getSims().subscribe({
      next: (data: Sim[]) => {
        this.simCards = data;
        this.calcularStats();
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Error al traer SIMS:', err);
      }
    });
  }

  calcularStats() {
    this.stats.total = this.simCards.length;

    this.stats.active = this.simCards.filter(
      s => s.estado === 'Activa'
    ).length;

    this.stats.inactive = this.simCards.filter(
      s => s.estado === 'Desactivada'
    ).length;

    const operadoresUnicos = new Set(
      this.simCards.map(s => s.operador)
    );

    this.stats.operators = operadoresUnicos.size;
  }

  get filteredSims(): Sim[] {
    return this.simCards.filter(sim =>
      Object.values(sim).some(value =>
        value?.toString().toLowerCase().includes(this.searchText.toLowerCase())
      )
    );
  }

  get paginatedSims(): Sim[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredSims.slice(start, start + this.itemsPerPage);
  }

  nextPage() {
    if ((this.currentPage * this.itemsPerPage) < this.filteredSims.length) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  uploadExcel() {
    console.log('Subir Excel');
  }

 generateReport() {
  const url = 'http://localhost:3000/api/reportes/excel-general';
  window.location.href = url;
}

  addSim() {
    this.router.navigate(['/sim-form']);
  }
  verHistorial(sim: any) {
    const id = sim.id_sim;
    this.simSeleccionadaNumero = sim.num_sim;

    this.http.get(`http://localhost:3000/api/sims/${id}/historial`).subscribe({
      next: (data: any) => {
        this.historialSim = data;
        this.mostrarModalHistorial = true;
      },
      error: (err) => {
        console.error('Error al obtener historial:', err);
        alert("No se pudo cargar el historial.");
      }
    });
  }

  cerrarHistorial() {
    this.mostrarModalHistorial = false;
    this.historialSim = [];
  }

  editSim(sim: any) {
    const id = sim.id_sim; 
    if (id) {
      this.router.navigate(['/sim-form', id]);
    }
  }

  deleteSim(sim: any) {
    const idABorrar = sim.id_sim;

    if (!idABorrar) {
      alert("❌ No se encontró el ID de este registro.");
      return;
    }

    if (confirm(`¿Estás seguro de que deseas eliminar la línea ${sim.num_linea}?`)) {
      this.simService.deleteSim(idABorrar).subscribe({
        next: () => {
          alert("✅ Registro eliminado correctamente.");
          this.obtenerSims(); 
        },
        error: (err: any) => { 
          console.error('Error al borrar:', err);
          alert("❌ Hubo un fallo en el servidor al intentar eliminar.");
        }
      });
    }
  }
}