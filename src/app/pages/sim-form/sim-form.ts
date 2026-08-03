import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { Header } from '../../shared/header/header';
import { SimService } from '../../services/sim.service';

@Component({
  selector: 'app-sim-form',
  standalone: true,
  imports: [CommonModule, FormsModule, Header, RouterModule],
  templateUrl: './sim-form.html',
  styleUrls: ['./sim-form.css']
})
export class SimForm implements OnInit {
  sim: Record<string, any> = {};
  nuevaIp = '';
  nuevoApn = '';
  data$!: Observable<any>;
  
  isEdit = false;
  idSim: string | null = null;

  constructor(
    private simService: SimService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef // Injectamos el detector de cambios
  ) {}

  ngOnInit(): void {
    this.resetForm();
    this.idSim = this.route.snapshot.paramMap.get('id');
    
    // 1. Cargar las listas desplegables
    this.cargarSelects();

    // 2. Si es edición, cargar los datos de la SIM
    if (this.idSim) {
      this.isEdit = true;
      this.cargarDatosSim(this.idSim);
    } else {
      this.isEdit = false;
    }
  }

  cargarDatosSim(id: string): void {
    this.simService.getSimById(id).subscribe({
      next: (data: any) => {
        // Asignación con conversión segura a String para evitar descalce con los select
        this.sim = {
          ...data, 
          numeroSim: data.num_sim || data.numeroSim || '',
          numeroLinea: data.num_linea || data.numeroLinea || '',
          pin: data.cod_pin || data.pin || '',
          puk: data.cod_puk || data.puk || '',
          tipoSimId: data.id_tiposim != null ? String(data.id_tiposim) : '',
          operadorId: data.id_operador != null ? String(data.id_operador) : '',
          planId: data.id_plan != null ? String(data.id_plan) : '',
          capacidadId: data.id_capacidad != null ? String(data.id_capacidad) : '',
          estadoId: data.id_estado != null ? String(data.id_estado) : '',
          responsableId: data.id_responsable != null ? String(data.id_responsable) : '',
          ubicacionId: data.id_ubicacion != null ? String(data.id_ubicacion) : '',
          destinoId: data.id_destino != null ? String(data.id_destino) : '',
          observacion: data.observacion || '', 
          ip: data.ips || data.ip || [],
          apn: data.apns || data.apn || [],
          razonModificacion: '' 
        };

        // Forzamos a Angular a re-renderizar la vista con los nuevos datos al instante
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Error al cargar datos:", err)
    });
  }

  resetForm(): void {
    this.sim = {
      numeroSim: '', numeroLinea: '', pin: '', puk: '',
      tipoSimId: '', operadorId: '', planId: '', capacidadId: '', estadoId: '',
      responsableId: '', ubicacionId: '', destinoId: '',
      ip: [], apn: [], observacion: '', razonModificacion: '' 
    };
    this.nuevaIp = '';
    this.nuevoApn = '';
  }

  cargarSelects(): void {
    this.data$ = forkJoin({
      operadores: this.simService.getOperadores(),
      planes: this.simService.getPlanes(),
      capacidades: this.simService.getCapacidades(),
      estados: this.simService.getEstados(),
      tiposSim: this.simService.getTiposSim(),
      responsables: this.simService.getResponsables(),
      ubicaciones: this.simService.getUbicaciones(),
      destinos: this.simService.getDestinos()
    });
  }

  agregarIp(): void {
    const ipLimpia = this.nuevaIp.trim();
    if (!ipLimpia) return;
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

    if (!ipRegex.test(ipLimpia)) {
      alert(`⚠️ La IP "${ipLimpia}" no tiene un formato válido.`);
      return;
    }
    if (!this.sim['ip']) this.sim['ip'] = [];
    if (this.sim['ip'].includes(ipLimpia)) {
      alert(`⚠️ La dirección IP "${ipLimpia}" ya está agregada.`);
      return;
    }
    this.sim['ip'].push(ipLimpia);
    this.nuevaIp = '';
  }

  agregarApn(): void {
    const apnLimpio = this.nuevoApn.trim();
    if (!apnLimpio) return;
    const apnRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$|^[a-zA-Z0-9.-]+$/;

    if (!apnRegex.test(apnLimpio)) {
      alert(`⚠️ El APN "${apnLimpio}" no tiene un formato válido.`);
      return;
    }
    if (!this.sim['apn']) this.sim['apn'] = [];
    if (this.sim['apn'].includes(apnLimpio)) {
      alert(`⚠️ El APN "${apnLimpio}" ya está agregado.`);
      return;
    }
    this.sim['apn'].push(apnLimpio);
    this.nuevoApn = '';
  }

  eliminarIp(index: number): void { 
    if (this.sim['ip']) this.sim['ip'].splice(index, 1); 
  }
  
  eliminarApn(index: number): void { 
    if (this.sim['apn']) this.sim['apn'].splice(index, 1); 
  }

  guardar(): void {
    if (this.isEdit && (!this.sim['razonModificacion'] || this.sim['razonModificacion'].trim().length < 5)) {
      alert("⚠️ Debes ingresar una razón para la modificación (mínimo 5 caracteres).");
      return;
    }

    let pinVal = this.sim['pin'] ? this.sim['pin'].toString().trim() : '';
    let pukVal = this.sim['puk'] ? this.sim['puk'].toString().trim() : '';

    if (pinVal === '') pinVal = '0000'; 
    if (pukVal === '') pukVal = '00000000'; 
  
    if (pinVal !== '0' && pinVal !== '0000' && pinVal.length !== 4) {
      alert("⚠️ El PIN debe tener 4 dígitos.");
      return;
    }
    if (pukVal !== '0' && pukVal !== '00000000' && pukVal.length !== 8) {
      alert("⚠️ El PUK debe tener 8 dígitos.");
      return;
    }

    this.sim['pin'] = pinVal;
    this.sim['puk'] = pukVal;

    if (this.isEdit && this.idSim) {
      this.simService.updateSim(this.idSim, this.sim).subscribe({
        next: () => {
          alert("✅ SIM actualizada e historial registrado correctamente");
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.error("Error al actualizar:", err);
          const errorMsg = err.error?.error || err.error?.message || "Error al actualizar.";
          alert("⚠️ Error: " + errorMsg);
        }
      });
    } else {
      this.simService.createSim(this.sim).subscribe({
        next: () => {
          alert("✅ SIM registrada correctamente");
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.error("Error al registrar:", err);
          const errorMsg = err.error?.error || err.error?.message || "Error al registrar.";
          alert("⚠️ Error al registrar: " + errorMsg);
        }
      });
    }
  }

  cancelar(): void {
    this.router.navigate(['/home']); 
  }
}