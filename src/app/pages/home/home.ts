import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // <--- 1. Importar ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { SimService } from '../../services/sim.service';
import { AuthService } from '../../services/auth.service';
import { Sim } from '../../interceptors/models/sim.model';
import { Header } from '../../shared/header/header';
import { CarruselComponent } from '../carrusel/carrusel';
import { Historial } from '../historial/historial';

// Componentes visuales
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
  // Lista de tarjetas SIM
  simCards: Sim[] = [];
  
  // Permisos de edición
  puedeModificar = false;

  // Variables para el modal de historial
  mostrarModalHistorial = false;
  historialSim: any[] = [];
  simSeleccionadaNumero = '';

  // Conteo para las tarjetas de inicio
  stats = { total: 0, claro: 0, movistar: 0, operators: 0 };

  constructor(
    private router: Router,
    private simService: SimService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef // 
  ) {}

  ngOnInit(): void {
    // Revisa si el usuario es administrador
    this.puedeModificar = this.authService.esAdmin();

    // Carga datos guardados previamente si existen
    const cacheData = localStorage.getItem('simCards_cache');
    if (cacheData) {
      try {
        this.simCards = JSON.parse(cacheData);
        this.calcularStats();
      } catch (e) {
        console.error('Error al leer caché:', e);
      }
    }

    // Trae los datos actualizados del servidor
    this.obtenerSims();
  }

  // Pide la lista de SIMs al backend
  obtenerSims(): void {
    this.simService.getSims().subscribe({
      next: (data: Sim[]) => {
        this.simCards = data;
        this.calcularStats();
        
        // Guarda en caché
        localStorage.setItem('simCards_cache', JSON.stringify(data));

        // <--- 3. Forzamos a Angular a actualizar la interfaz inmediatamente
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al traer SIMS:', err)
    });
  }

  // Calcula el total por operador
  calcularStats(): void {
    this.stats.total = this.simCards.length;

    // Cuenta Claro
    this.stats.claro = this.simCards.filter(s => {
      const opText = s.operador?.toString().toLowerCase() || '';
      const opId = Number(s.id_operador || s.operadorId);
      return opId === 1 || opText.includes('claro');
    }).length;

    // Cuenta Movistar
    this.stats.movistar = this.simCards.filter(s => {
      const opText = s.operador?.toString().toLowerCase() || '';
      const opId = Number(s.id_operador || s.operadorId);
      return opId === 2 || opText.includes('movistar');
    }).length;

    // Total de operadores diferentes
    const operadoresUnicos = new Set(this.simCards.map(s => s.operador || s.id_operador));
    this.stats.operators = operadoresUnicos.size;
  }

  // Descarga el reporte en Excel
  generateReport(): void {
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

  // Va al formulario para editar la SIM
  editSim(sim: Sim): void { 
    if (sim.id_sim) {
      this.router.navigate(['/sim-form', sim.id_sim]);
    } 
  }

  // Elimina una tarjeta SIM
  deleteSim(sim: Sim): void {
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

  // Abre el modal con el historial
  verHistorial(sim: Sim): void {
    const idSim = sim.id_sim;
    if (!idSim) return;

    this.simSeleccionadaNumero = sim.num_linea;
    this.simService.getHistorial(idSim).subscribe({
      next: (data) => {
        this.historialSim = data;
        this.mostrarModalHistorial = true;
        this.cdr.detectChanges(); //También se actualiza al abrir el modal
      },
      error: () => alert('Error al cargar historial.')
    });
  }

  // Cierra el modal de historial
  cerrarHistorial(): void {
    this.mostrarModalHistorial = false;
    this.historialSim = [];
    this.simSeleccionadaNumero = '';
    this.cdr.detectChanges();
  }
}