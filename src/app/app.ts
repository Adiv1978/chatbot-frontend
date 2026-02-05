import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from './services/auth'; //

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  private router = inject(Router);
  // Inyectamos el servicio como PUBLIC para que el HTML lo vea
  public authService = inject(AuthService); 
  
  mostrarMenu: boolean = false;

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Mantenemos tu lógica: ocultar en login o raíz
      this.mostrarMenu = event.url !== '/login' && event.url !== '/';
    });
  }

  cerrarSesion() {
    // Usamos el método centralizado de tu servicio
    this.authService.logout(); 
    this.router.navigate(['/login']);
  }
}