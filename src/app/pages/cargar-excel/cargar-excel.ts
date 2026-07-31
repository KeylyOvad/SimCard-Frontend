import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { Header } from '../../shared/header/header';
import { SimService } from '../../services/sim.service';

// Componentes PrimeNG
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';

// Modelo del resultado
interface ResultadoImportacion {
  guardadas?: number;
  omitidas?: number;
  error?: boolean;
  mensaje?: string;
}

// Modelo del error
interface ErrorFila {
  fila: string | number;
  error: string;
}

@Component({
  selector: 'app-cargar-excel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Header,
    ButtonModule,
    ProgressSpinnerModule,
    MessageModule,
    TableModule
  ],
  templateUrl: './cargar-excel.html',
  styleUrls: ['./cargar-excel.css']
})
export class CargarExcelComponent {
  // Archivo seleccionado
  archivoSeleccionado: File | null = null;
  nombreArchivo = '';

  // Estados de carga y consola
  cargando = false;
  mostrarConsola = false;
  progreso = 0;
  logs: string[] = [];

  // Estados de los pasos
  estadoPaso1 = 'Pendiente';
  estadoPaso2 = 'Pendiente';
  estadoPaso3 = 'Pendiente';

  colorPaso1 = '#718096';
  colorPaso2 = '#718096';
  colorPaso3 = '#718096';

  // Resumen del resultado y errores
  resultado: ResultadoImportacion | null = null;
  errores: ErrorFila[] = [];

  constructor(
    private simService: SimService,
    private cdr: ChangeDetectorRef
  ) {}

  // Seleccionar archivo desde explorador
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.procesarArchivo(input.files[0]);
    }
  }

  // Drag & Drop
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.procesarArchivo(event.dataTransfer.files[0]);
    }
  }

  private procesarArchivo(file: File): void {
    this.archivoSeleccionado = file;
    this.nombreArchivo = file.name;
    this.resetEstado();
    this.agregarLog(`📁 Archivo seleccionado: ${this.nombreArchivo}`);
  }

  // Limpiar selección
  limpiarArchivo(inputElement?: HTMLInputElement): void {
    this.archivoSeleccionado = null;
    this.nombreArchivo = '';
    this.mostrarConsola = false;
    this.resetEstado();

    if (inputElement) {
      inputElement.value = '';
    }
  }

  // Enviar archivo al servidor
  subirExcel(): void {
    if (!this.archivoSeleccionado) return;

    this.cargando = true;
    this.mostrarConsola = true;
    this.resetEstado();

    // Actualizar Paso 1: Lectura
    this.estadoPaso1 = 'En proceso...';
    this.colorPaso1 = '#d97706';
    this.progreso = 30;
    this.agregarLog('📄 Leyendo contenido del archivo Excel...');

    const formData = new FormData();
    formData.append('archivo', this.archivoSeleccionado);

    // Simulación de avance hacia paso 2
    setTimeout(() => {
      this.estadoPaso1 = 'Completado';
      this.colorPaso1 = '#16a34a';
      this.estadoPaso2 = 'En proceso...';
      this.colorPaso2 = '#d97706';
      this.progreso = 65;
      this.agregarLog('🔍 Validando estructura de columnas y formatos numéricos...');
    }, 800);

    this.simService.importarExcel(formData)
      .pipe(
        finalize(() => {
          this.cargando = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res: any) => {
          // Paso 2 y 3 Completados
          this.estadoPaso2 = 'Completado';
          this.colorPaso2 = '#16a34a';
          this.estadoPaso3 = 'Completado';
          this.colorPaso3 = '#16a34a';
          this.progreso = 100;

          this.agregarLog(`✅ Inserción finalizada: ${res.guardadas || 0} guardados, ${res.omitidas || 0} con observaciones.`);

          // Muestra resumen
          this.resultado = {
            guardadas: res.guardadas || 0,
            omitidas: res.omitidas || 0
          };

          // Muestra errores si aplican
          if (res.errores && res.errores.length > 0) {
            this.errores = res.errores.map((e: any) => ({
              fila: e.fila || 'N/A',
              error: this.formatearMensajeError(e)
            }));
            this.agregarLog(`⚠️ Se detectaron ${this.errores.length} filas con inconsistencias.`);
          } else {
            this.errores = [];
          }
        },
        error: (err) => {
          console.error('Error al importar Excel:', err);

          this.estadoPaso2 = 'Error';
          this.colorPaso2 = '#dc2626';
          this.estadoPaso3 = 'Cancelado';
          this.colorPaso3 = '#dc2626';

          this.agregarLog('❌ Error de comunicación con el servidor o formato de archivo inválido.');

          this.resultado = {
            error: true,
            mensaje: 'No se pudo procesar el archivo. Valida que el servidor esté activo y el formato sea el correcto.'
          };
        }
      });
  }

  private resetEstado(): void {
    this.resultado = null;
    this.errores = [];
    this.progreso = 0;
    this.logs = [];

    this.estadoPaso1 = 'Pendiente';
    this.estadoPaso2 = 'Pendiente';
    this.estadoPaso3 = 'Pendiente';

    this.colorPaso1 = '#718096';
    this.colorPaso2 = '#718096';
    this.colorPaso3 = '#718096';
  }

  private agregarLog(mensaje: string): void {
    const hora = new Date().toLocaleTimeString();
    this.logs.push(`[${hora}] ${mensaje}`);
  }

  private formatearMensajeError(e: any): string {
    if (Array.isArray(e.problemas)) return e.problemas.join(', ');
    if (typeof e.problemas === 'string') return e.problemas;
    return e.error || e.mensaje || 'Datos inconsistentes con el formato esperado';
  }
}