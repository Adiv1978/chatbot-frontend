import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  // Importamos RouterModule para poder usar routerLink
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  private router = inject(Router);
  
  mostrarMenu: boolean = false;

  constructor() {
    // Escuchamos los cambios de ruta para decidir si mostramos el menú
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Si la URL es '/login', ocultamos el menú. Si es otra, lo mostramos.
      this.mostrarMenu = event.url !== '/login' && event.url !== '/';
    });
  }

  cerrarSesion() {
    // 1. Borramos el token
    localStorage.removeItem('token_chatbot');
    // 2. Redirigimos al login
    this.router.navigate(['/login']);
  }
}