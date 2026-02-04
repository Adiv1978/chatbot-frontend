import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { CobrosCargaMasivaComponent } from './components/cobros-carga-masiva/cobros-carga-masiva';
import { GestionarCobroComponent } from './components/gestionar-cobro/gestionar-cobro';
import { authGuard } from './guards/auth.guard';
import { BorrarPagosComponent } from './components/borrar-pagos/borrar-pagos';
import { ListaCobroComponent } from './components/lista-cobro/lista-cobro';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'carga-masiva', component: CobrosCargaMasivaComponent, canActivate: [authGuard] },
    { path: 'gestionar-cobro', component: GestionarCobroComponent, canActivate: [authGuard] },
    { path: 'borrar-pagos', component: BorrarPagosComponent, canActivate: [authGuard] },
    { path: 'lista-cobros', component: ListaCobroComponent, canActivate: [authGuard] },
    { path: '**', redirectTo: 'login' }
];
