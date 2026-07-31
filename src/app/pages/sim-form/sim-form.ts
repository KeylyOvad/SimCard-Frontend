import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
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
  // Variables principales del formulario
  sim: Record<string, any> = {};
  nuevaIp = '';
  nuevoApn = '';
  data$!: Observable<any>;
  
  // Modos de vista
  isEdit = false;
  idSim: string | null = null;

  constructor(
    private simService: SimService,
    private router: Router,
    private route: ActivatedRoute 
  ) {}

  ngOnInit(): void {
    // Inicializa formulario y carga listas desplegables
    this.resetForm();
    this.cargarSelects();
    this.idSim = this.route.snapshot.paramMap.get('id');
    
    // Si hay un ID en la ruta se cambia a modo edicion
    if (this.idSim) {
      this.isEdit = true;
      this.cargarDatosSim(this.idSim);
    } else {
      this.isEdit = false;
    }
  }

  // Trae los datos de la SIM a editar
  cargarDatosSim(id: string): void {
    this.simService.getSimById(id).subscribe({
      next: (data: any) => {
        this.sim = {
          ...data, 
          numeroSim: data.num_sim,
          numeroLinea: data.num_linea,
          pin: data.cod_pin,
          puk: data.cod_puk,
          tipoSimId: data.id_tiposim,
          operadorId: data.id_operador,
          planId: data.id_plan,
          capacidadId: data.id_capacidad,
          estadoId: data.id_estado,
          responsableId: data.id_responsable,
          ubicacionId: data.id_ubicacion,
          destinoId: data.id_destino,
          observacion: data.observacion || '', 
          ip: data.ips || [],
          apn: data.apns || [],
          razonModificacion: '' 
        };
      },
      error: (err) => console.error("Error al cargar datos:", err)
    });
  }

  // Limpia los campos del formulario
  resetForm(): void {
    this.sim = {
      numeroSim: '', 
      numeroLinea: '', 
      pin: '', 
      puk: '',
      tipoSimId: '', 
      operadorId: '', 
      planId: '', 
      capacidadId: '', 
      estadoId: '',
      responsableId: '', 
      ubicacionId: '', 
      destinoId: '',
      ip: [], 
      apn: [], 
      observacion: '', 
      razonModificacion: '' 
    };
    this.nuevaIp = '';
    this.nuevoApn = '';
  }

  // Carga todas las listas desplegables al mismo tiempo
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

  // Valida y agrega una IP a la lista
  agregarIp(): void {
    const ipLimpia = this.nuevaIp.trim();
    if (!ipLimpia) return;

    // Regla para verificar formato de IP
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

  // Valida y agrega un APN a la lista
  agregarApn(): void {
    const apnLimpio = this.nuevoApn.trim();
    if (!apnLimpio) return;

    // Regla para verificar formato de APN
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

  // Elimina una IP por su posicion
  eliminarIp(index: number): void { 
    if (this.sim['ip']) this.sim['ip'].splice(index, 1); 
  }
  
  // Elimina un APN por su posicion
  eliminarApn(index: number): void { 
    if (this.sim['apn']) this.sim['apn'].splice(index, 1); 
  }

  // Valida y guarda o actualiza la informacion
  guardar(): void {
    // Valida razon al editar
    if (this.isEdit && (!this.sim['razonModificacion'] || this.sim['razonModificacion'].trim().length < 5)) {
      alert("⚠️ Debes ingresar una razón para la modificación (mínimo 5 caracteres).");
      return;
    }

    // Valores por defecto para PIN y PUK
    let pinVal = this.sim['pin'] ? this.sim['pin'].toString().trim() : '';
    let pukVal = this.sim['puk'] ? this.sim['puk'].toString().trim() : '';

    if (pinVal === '') pinVal = '0000'; 
    if (pukVal === '') pukVal = '00000000'; 
  
    // Validacion de digitos de PIN y PUK
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

    // Actualiza o crea el registro segun el caso
    if (this.isEdit && this.idSim) {
      this.simService.updateSim(this.idSim, this.sim).subscribe({
        next: () => {
          alert("✅ SIM actualizada e historial registrado correctamente");
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.error("Error al actualizar:", err);
          const errorMsg = err.error?.error || err.error?.message || "La dirección IP o datos clave ya pertenecen a otro registro.";
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
          const errorMsg = err.error?.error || err.error?.message || "Comprueba que la dirección IP o el número de SIM no estén duplicados en el sistema.";
          alert("⚠️ Error al registrar: " + errorMsg);
        }
      });
    }
  }

  // Cancela y regresa al inicio
  cancelar(): void {
    this.router.navigate(['/home']); 
  }
}