import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Inicializamos el objeto que usa el HTML
  usuario = {
    nombreUsuario: '',
    clave: ''
  };

  ngOnInit() {
    if (this.authService.estaLogueado()) {
      this.router.navigate(['/lista-cobros']);
    }
  }

  login() {
    if (!this.usuario.nombreUsuario || !this.usuario.clave) {
      alert('Por favor, ingrese sus credenciales');
      return;
    }

    // Mapeamos los campos del formulario al DTO que espera el servicio
    const credenciales = {
      nick: this.usuario.nombreUsuario,
      pass: this.usuario.clave
    };

    this.authService.login(credenciales).subscribe({
      next: (resp) => {
        if (resp.exito) {
          this.router.navigate(['/lista-cobros']);
        } else {
          alert(resp.mensaje || 'Credenciales incorrectas');
        }
      },
      error: (err) => alert('Error al conectar con el servidor')
    });
  }
}