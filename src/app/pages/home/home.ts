import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { SimService } from '../../services/sim.service';
import { AuthService } from '../../services/auth.service';
import { Sim } from '../../interceptors/models/sim.model';
import { Header } from '../../shared/header/header';
import { CarruselComponent } from '../carrusel/carrusel';
import { Historial } from '../historial/historial';

// Módulos UI de PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    Header,
    CarruselComponent,
    Historial,
    TableModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class Home implements OnInit {
  simCards: Sim[] = [];
  puedeModificar = false;

  mostrarModalHistorial = false;
  historialSim: any[] = [];
  simSeleccionadaNumero = '';

  stats = { total: 0, claro: 0, movistar: 0, operators: 0 };

  constructor(
    private router: Router,
    private simService: SimService,
    private authService: AuthService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.puedeModificar = this.authService.esAdmin();
    this.obtenerSims();
  }

  obtenerSims() {
    this.simService.getSims().subscribe({
      next: (data: Sim[]) => {
        this.simCards = data;
        this.calcularStats();
        this.cd.detectChanges();
      },
      error: (err) => console.error('Error al traer SIMS:', err)
    });
  }

  calcularStats() {
    this.stats.total = this.simCards.length;
    this.stats.claro = this.simCards.filter(s => {
      const opText = s.operador?.toString().toLowerCase() || '';
      const opId = Number((s as any).id_operador || (s as any).operadorId);
      return opId === 1 || opText.includes('claro');
    }).length;

    this.stats.movistar = this.simCards.filter(s => {
      const opText = s.operador?.toString().toLowerCase() || '';
      const opId = Number((s as any).id_operador || (s as any).operadorId);
      return opId === 2 || opText.includes('movistar');
    }).length;

    const operadoresUnicos = new Set(this.simCards.map(s => s.operador || (s as any).id_operador));
    this.stats.operators = operadoresUnicos.size;
  }

  // Descarga del reporte Excel
  generateReport() {
    this.simService.descargarReporteExcel().subscribe({
      next: (archivoBlob: Blob) => {
        const urlDescarga = window.URL.createObjectURL(archivoBlob);
        const linkTemporal = document.createElement('a');
        linkTemporal.href = urlDescarga;
        linkTemporal.download = 'Reporte_SIMCARDS_CENS.xlsx'; 
        
        document.body.appendChild(linkTemporal);
        linkTemporal.click();
        
        document.body.removeChild(linkTemporal);
        window.URL.revokeObjectURL(urlDescarga);
      },
      error: async (err) => {
        console.error('Error al descargar:', err);
        if (err.error instanceof Blob) {
          try {
            const textoError = await err.error.text();
            const jsonError = JSON.parse(textoError);
            alert(`⚠️ Error: ${jsonError.message}`);
          } catch {
            alert('⚠️ Error al procesar el reporte.');
          }
        } else {
          alert('⚠️ Sesión expirada o permisos insuficientes.');
        }
      }
    });
  }

  addSim() { 
    this.router.navigate(['/sim-form']); 
  }

  editSim(sim: any) { 
    if (sim.id_sim) {
      this.router.navigate(['/sim-form', sim.id_sim]);
    } 
  }

  deleteSim(sim: any) {
    const idABorrar = sim.id_sim;
    if (!idABorrar) { 
      alert('❌ ID no encontrado.'); 
      return; 
    }

    if (confirm(`¿Estás seguro de eliminar la línea ${sim.num_linea}?`)) {
      this.simService.deleteSim(idABorrar).subscribe({
        next: () => {
          alert('✅ Eliminado correctamente.');
          this.obtenerSims();
        },
        error: () => alert('❌ Error al eliminar.')
      });
    }
  }

  verHistorial(sim: any) {
    this.simSeleccionadaNumero = sim.num_linea;
    this.simService.getHistorial(sim.id_sim).subscribe({
      next: (data) => {
        this.historialSim = data;
        this.mostrarModalHistorial = true;
      },
      error: () => alert('Error al cargar historial.')
    });
  }

  cerrarHistorial() {
    this.mostrarModalHistorial = false;
    this.historialSim = [];
    this.simSeleccionadaNumero = '';
  }
}