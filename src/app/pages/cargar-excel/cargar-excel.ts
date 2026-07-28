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

interface ResultadoImportacion {
  guardadas?: number;
  omitidas?: number;
  error?: boolean;
  mensaje?: string;
}

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
  archivoSeleccionado: File | null = null;
  nombreArchivo = '';

  cargando = false;
  resultado: ResultadoImportacion | null = null;
  errores: ErrorFila[] = [];

  constructor(
    private simService: SimService,
    private cdr: ChangeDetectorRef
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.archivoSeleccionado = input.files[0];
      this.nombreArchivo = this.archivoSeleccionado.name;
      this.resetEstado();
    }
  }

  // Métodos para permitir Arrastrar y Soltar (Drag y Drop)
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
      this.archivoSeleccionado = event.dataTransfer.files[0];
      this.nombreArchivo = this.archivoSeleccionado.name;
      this.resetEstado();
    }
  }

  limpiarArchivo(inputElement?: HTMLInputElement): void {
    this.archivoSeleccionado = null;
    this.nombreArchivo = '';
    this.resetEstado();

    if (inputElement) {
      inputElement.value = '';
    }
  }

  subirExcel(): void {
    if (!this.archivoSeleccionado) return;

    this.cargando = true;
    this.resetEstado();

    const formData = new FormData();
    formData.append('archivo', this.archivoSeleccionado);

    this.simService.importarExcel(formData)
      .pipe(
        finalize(() => {
          this.cargando = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res: any) => {
          this.resultado = {
            guardadas: res.guardadas || 0,
            omitidas: res.omitidas || 0
          };

          if (res.errores && res.errores.length > 0) {
            this.errores = res.errores.map((e: any) => ({
              fila: e.fila || 'N/A',
              error: this.formatearMensajeError(e)
            }));
          } else {
            this.errores = [];
          }
        },
        error: (err) => {
          console.error('Error al importar Excel:', err);

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
  }

  private formatearMensajeError(e: any): string {
    if (Array.isArray(e.problemas)) return e.problemas.join(', ');
    if (typeof e.problemas === 'string') return e.problemas;
    return e.error || e.mensaje || 'Datos inconsistentes con el formato esperado';
  }
}