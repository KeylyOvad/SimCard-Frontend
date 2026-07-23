import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Header } from '../../shared/header/header';

@Component({
  selector: 'app-sim-form',
  standalone: true,
  imports: [CommonModule, FormsModule, Header, RouterModule],
  templateUrl: './sim-form.html',
  styleUrls: ['./sim-form.css']
})
export class SimForm implements OnInit {
  sim: any = {};
  nuevaIp = '';
  nuevoApn = '';
  data$!: Observable<any>;
  
  isEdit: boolean = false;
  idSim: string | null = null;

  constructor(
    private http: HttpClient, 
    private router: Router,
    private route: ActivatedRoute 
  ) {}

  ngOnInit(): void {
    this.resetForm();
    this.cargarSelects();
    this.idSim = this.route.snapshot.paramMap.get('id');
    if (this.idSim) {
      this.isEdit = true;
      this.cargarDatosSim(this.idSim);
    } else {
      this.isEdit = false;
    }
  }

  cargarDatosSim(id: string) {
    this.http.get(`http://localhost:3000/api/sims/${id}`).subscribe({
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

  resetForm() {
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

  cargarSelects() {
    this.data$ = forkJoin({
      operadores: this.http.get('http://localhost:3000/api/operadores'),
      planes: this.http.get('http://localhost:3000/api/planes'),
      capacidades: this.http.get('http://localhost:3000/api/capacidad'),
      estados: this.http.get('http://localhost:3000/api/estados'),
      tiposSim: this.http.get('http://localhost:3000/api/tiposim'),
      responsables: this.http.get('http://localhost:3000/api/responsables'),
      ubicaciones: this.http.get('http://localhost:3000/api/ubicaciones'),
      destinos: this.http.get('http://localhost:3000/api/destinos')
    });
  }

  // --- VALIDACIÓN Y ADICIÓN DE IP ---
  agregarIp() {
    const ipLimpia = this.nuevaIp.trim();

    if (!ipLimpia) return;

    // RegEx para formato IPv4 (0.0.0.0 a 255.255.255.255)
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

    if (!ipRegex.test(ipLimpia)) {
      alert(`⚠️ La IP "${ipLimpia}" no tiene un formato válido (ejemplo: 192.168.1.10).`);
      return;
    }

    if (!this.sim.ip) this.sim.ip = [];

    if (this.sim.ip.includes(ipLimpia)) {
      alert(`⚠️ La dirección IP "${ipLimpia}" ya está agregada en la lista.`);
      return;
    }

    this.sim.ip.push(ipLimpia);
    this.nuevaIp = '';
  }

  // --- VALIDACIÓN Y ADICIÓN DE APN ---
  agregarApn() {
    const apnLimpio = this.nuevoApn.trim();

    if (!apnLimpio) return;

    // RegEx estándar para dominios o nombres APN (ej: internet.com, movistar.pe)
    const apnRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$|^[a-zA-Z0-9.-]+$/;

    if (!apnRegex.test(apnLimpio)) {
      alert(`⚠️ El APN "${apnLimpio}" no tiene un formato válido (ejemplo: internet.com).`);
      return;
    }

    if (!this.sim.apn) this.sim.apn = [];

    if (this.sim.apn.includes(apnLimpio)) {
      alert(`⚠️ El APN "${apnLimpio}" ya está agregado en la lista.`);
      return;
    }

    this.sim.apn.push(apnLimpio);
    this.nuevoApn = '';
  }

  eliminarIp(index: number) { this.sim.ip.splice(index, 1); }
  eliminarApn(index: number) { this.sim.apn.splice(index, 1); }

  guardar() {
    if (this.isEdit && (!this.sim.razonModificacion || this.sim.razonModificacion.trim().length < 5)) {
      alert("⚠️ Debes ingresar una razón para la modificación (mínimo 5 caracteres).");
      return;
    }

    let pinVal = this.sim.pin ? this.sim.pin.toString().trim() : '';
    let pukVal = this.sim.puk ? this.sim.puk.toString().trim() : '';

    if (pinVal === '') {
      pinVal = '0000'; 
    }
    
    if (pukVal === '') {
      pukVal = '00000000'; 
    }
  
    if (pinVal !== '0' && pinVal !== '0000' && pinVal.length !== 4) {
      alert("⚠️ El PIN debe tener 4 dígitos.");
      return;
    }
    if (pukVal !== '0' && pukVal !== '00000000' && pukVal.length !== 8) {
      alert("⚠️ El PUK debe tener 8 dígitos.");
      return;
    }

    this.sim.pin = pinVal;
    this.sim.puk = pukVal;

    if (this.isEdit) {
      this.http.put(`http://localhost:3000/api/sims/${this.idSim}`, this.sim).subscribe({
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
      this.http.post('http://localhost:3000/api/sims', this.sim).subscribe({
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

  cancelar() {
    this.router.navigate(['/home']); 
  }
}