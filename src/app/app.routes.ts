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
{ path: 'parametros/operadores', component: Operadores },
{ path: 'parametros/planes', component: Planes},
{ path: 'parametros/simcard', component: TipoSim },
{ path: 'parametros/capacidad', component: Capacidad },
{ path: 'parametros/ubicaciones', component: Ubicaciones},
{ path: 'parametros/destinos', component: Destino},
{ path: 'parametros/responsables', component: Responsables },
{ path: 'parametros/estados', component: Estado }

];