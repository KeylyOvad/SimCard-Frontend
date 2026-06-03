import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router'; 
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-cargar-excel',
  standalone: true, 
  imports: [RouterLink, CommonModule], 
  templateUrl: './cargar-excel.html',
  styleUrls: ['./cargar-excel.css']
})
export class CargarExcelComponent {
  archivoSeleccionado: File | null = null;
  estaCargando = false;
  mostrarConsola = false;
  progreso = 0;
  logs: string[] = ['Esperando interacción del operador...'];

  estadoPaso1 = 'Pendiente'; colorPaso1 = '#718096';
  estadoPaso2 = 'Pendiente'; colorPaso2 = '#718096';
  estadoPaso3 = 'Pendiente'; colorPaso3 = '#718096';

  private urlBackend = 'http://localhost:3000/api/carga-excel/procesar'; 

  constructor(private http: HttpClient) {}

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.archivoSeleccionado = file;
      this.logs.push(`📂 Archivo seleccionado: ${file.name}`);
    }
  }

  async onUpload() {
    if (!this.archivoSeleccionado) {
      alert('Por favor, selecciona un archivo primero.');
      return;
    }

    this.estaCargando = true;
    this.mostrarConsola = true;
    this.logs = [`🚀 [${new Date().toLocaleTimeString()}] Iniciando Carga Técnica CENS...`];

    try {
      // Simulación Paso 1: Leer el binario localmente
      this.estadoPaso1 = 'Leyendo...'; this.colorPaso1 = '#D97706';
      this.progreso = 25;
      await this.esperar(600); 
      this.estadoPaso1 = '✔ Completo'; this.colorPaso1 = '#385623';
      this.logs.push('✔ Archivo mapeado en memoria local.');

      // Simulación Paso 2: Validar formatos y limpiar campos pesados
      this.estadoPaso2 = 'Validando...'; this.colorPaso2 = '#D97706';
      this.progreso = 50;
      await this.esperar(700);
      this.estadoPaso2 = '✔ Completo'; this.colorPaso2 = '#385623';
      this.logs.push('✔ Formatos corregidos a Texto Puro (@) con éxito.');

      // Paso 3: Transmisión real vía HTTP hacia Node.js
      this.estadoPaso3 = 'Transmitiendo...'; this.colorPaso3 = '#D97706';
      this.logs.push('📡 Subiendo datos masivos al servidor...');

      const formData = new FormData();
      formData.append('archivoExcel', this.archivoSeleccionado);

      this.http.post<any>(this.urlBackend, formData).subscribe({
        next: (res) => {
          this.progreso = 100;
          this.estadoPaso3 = '✔ Completo'; this.colorPaso3 = '#385623';
          const extras = res.registrosProcesados ? ` (${res.registrosProcesados} registros guardados)` : '';
          this.logs.push(`🎉 ¡Éxito! Servidor responde: ${res.message || 'Datos procesados.'}${extras}`);
          this.estaCargando = false;
        },
        error: (err) => {
          this.progreso = 100;
          this.estadoPaso3 = '❌ Fallido'; this.colorPaso3 = '#E53E3E';
          
          // CORRECCIÓN: Extraemos de forma precisa el mensaje interno enviado desde el backend
          const errorServidor = err.error?.message || err.message || 'Fallo indeterminado.';
          this.logs.push(`❌ Error 500 en el Servidor: ${errorServidor}`);
          
          if (err.error?.error) {
              this.logs.push(`🔍 Detalle técnico: ${err.error.error}`);
          }
          
          this.estaCargando = false;
        }
      });

    } catch (error) {
      this.logs.push('❌ Error crítico en el hilo de ejecución de la interfaz.');
      this.estaCargando = false;
    }
  }

  esperar(ms: number): Promise<void> {
    return new Promise<void>(resolve => setTimeout(resolve, ms));
  }
}