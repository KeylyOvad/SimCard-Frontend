import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Home } from './pages/home/home';
import { AuthGuard } from './guards/auth.guard';
import { UsuariosComponent } from './pages/usuarios/usuarios';
import { Parametros } from './pages/parametros/parametros';
import { Operadores } from './pages/parametros/operadores/operadores';
import { Planes } from './pages/parametros/planes/planes';
import { Capacidad } from './pages/parametros/capacidad/capacidad';
import { Ubicaciones } from './pages/parametros/ubicaciones/ubicaciones';
import { Destino } from './pages/parametros/destinos/destinos';
import { Responsables } from './pages/parametros/responsables/responsables';
import { Estado } from './pages/parametros/estados/estados';
import { TipoSim } from './pages/parametros/simcard/simcard';
import { SimForm } from './pages/sim-form/sim-form';
import { CargarExcelComponent } from './pages/cargar-excel/cargar-excel';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: 'home',
    component: Home,
    canActivate: [AuthGuard]
  },
  {
    path: 'usuarios',
    component: UsuariosComponent,
    canActivate: [AuthGuard]   
  },
  {
    path: 'parametros',
    component: Parametros,
    canActivate: [AuthGuard]
  },
  
  { 
    path: 'parametros/operadores', 
    component: Operadores, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'parametros/planes', 
    component: Planes, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'parametros/simcard', 
    component: TipoSim, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'parametros/capacidad', 
    component: Capacidad, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'parametros/ubicaciones', 
    component: Ubicaciones, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'parametros/destinos', 
    component: Destino, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'parametros/responsables', 
    component: Responsables, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'parametros/estados', 
    component: Estado, 
    canActivate: [AuthGuard] 
  },
  // Formulario SIM
  {
    path: 'sim-form',
    component: SimForm,
    canActivate: [AuthGuard]
  },
  {
    path: 'sim-form/:id',
    component: SimForm,
    canActivate: [AuthGuard]
  },
  
  {
    path: 'cargar-excel',
    component: CargarExcelComponent,
    canActivate: [AuthGuard]
  },
  
  {
    path: '**',
    redirectTo: 'login'
  }
];