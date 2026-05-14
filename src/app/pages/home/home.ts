import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

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

  constructor(
    private router: Router,
    private simService: SimService,
    private cd: ChangeDetectorRef
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
    console.log('Generar reporte');
  }

  addSim() {
    console.log('Agregar SIM');
  }

  editSim(sim: Sim) {
    console.log('Editar:', sim);
  }

  deleteSim(sim: Sim) {
    console.log('Eliminar:', sim);
  }
}
