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

    // Detectar si el componente carga para editar (si hay ID en la URL)
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
          // Corregido: Si no hay observación, queda vacío en lugar de 'AGPE'
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
      observacion: '', // Corregido: Se inicializa vacío para "Agregar SIM"
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

  agregarIp() {
    if (this.nuevaIp.trim()) {
      if (!this.sim.ip) this.sim.ip = [];
      this.sim.ip.push(this.nuevaIp.trim());
      this.nuevaIp = '';
    }
  }

  agregarApn() {
    if (this.nuevoApn.trim()) {
      if (!this.sim.apn) this.sim.apn = [];
      this.sim.apn.push(this.nuevoApn.trim());
      this.nuevoApn = '';
    }
  }

  eliminarIp(index: number) { this.sim.ip.splice(index, 1); }
  eliminarApn(index: number) { this.sim.apn.splice(index, 1); }

  guardar() {
    // Validar razón obligatoria solo si es edición
    if (this.isEdit && (!this.sim.razonModificacion || this.sim.razonModificacion.trim().length < 5)) {
      alert("⚠️ Debes ingresar una razón para la modificación (mínimo 5 caracteres).");
      return;
    }

    // Formateo de PIN y PUK
    const pinVal = this.sim.pin ? this.sim.pin.toString().trim() : '';
    const pukVal = this.sim.puk ? this.sim.puk.toString().trim() : '';

    if (pinVal !== '' && pinVal !== '0' && pinVal.length !== 4) {
      alert("⚠️ El PIN debe tener 4 dígitos.");
      return;
    }
    if (pukVal !== '' && pukVal !== '0' && pukVal.length !== 8) {
      alert("⚠️ El PUK debe tener 8 dígitos.");
      return;
    }

    this.sim.pin = pinVal;
    this.sim.puk = pukVal;

    if (this.isEdit) {
      // Petición para Actualizar
      this.http.put(`http://localhost:3000/api/sims/${this.idSim}`, this.sim).subscribe({
        next: () => {
          alert("✅ SIM actualizada e historial registrado correctamente");
          this.router.navigate(['/home']);
        },
        error: (err) => alert("❌ Error: " + (err.error?.error || "Error al actualizar"))
      });
    } else {
      
      this.http.post('http://localhost:3000/api/sims', this.sim).subscribe({
        next: () => {
          alert("✅ SIM registrada correctamente");
          this.router.navigate(['/home']);
        },
        error: (err) => alert("❌ Error: " + (err.error?.error || "Error al registrar"))
      });
    }
  }

  cancelar() {
    this.router.navigate(['/home']); 
  }
}