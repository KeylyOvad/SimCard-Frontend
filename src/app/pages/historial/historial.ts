import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

// Componentes PrimeNG
import { DialogModule } from 'primeng/dialog';
import { TimelineModule } from 'primeng/timeline';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';

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
  @Input() visible = false;
  @Input() historial: RegistroHistorial[] = [];
  @Input() numeroSim = '';

  @Output() cerrar = new EventEmitter<void>();

  cerrarModal(): void {
    this.cerrar.emit();
  }
}