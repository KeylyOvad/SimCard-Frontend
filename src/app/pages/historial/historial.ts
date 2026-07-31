import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

// Componentes primeng
import { DialogModule } from 'primeng/dialog';
import { TimelineModule } from 'primeng/timeline';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';

// Modelo de los datos del historial
interface RegistroHistorial {
  created_at: string;
  nombres: string;
  apellidos: string;
  num_sim: string;
  num_linea: string;
  pin: string;
  puk: string;
  tipo_sim: string;
  operador: string;
  plan: string;
  capacidad: string;
  estado: string;
  ips?: string;
  apns?: string;
  responsable?: string;
  ubicacion?: string;
  destino?: string;
  observacion?: string;
  razon: string;
}

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    TimelineModule,
    TagModule,
    ButtonModule
  ],
  templateUrl: './historial.html',
  styleUrls: ['./historial.css']
})
export class Historial {
  // Entradas desde el componente padre
  @Input() visible = false; // Muestra u oculta el modal
  @Input() historial: RegistroHistorial[] = []; // Lista de cambios
  @Input() numeroSim = ''; // Numero de SIM consultado

  // Salida para avisar al padre
  @Output() cerrar = new EventEmitter<void>();

  // Cierra la ventana modal
  cerrarModal(): void {
    this.cerrar.emit();
  }
}