import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core'; // <--- Agregar ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { UsuarioDTO } from '../../models/auth.models';
import Swal from 'sweetalert2'; 
import { finalize } from 'rxjs/operators';

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
  private cd = inject(ChangeDetectorRef); // <--- Inyectar el detector de cambios

  usuario: string = '';
  clave: string = '';
  cargando: boolean = false;

  ngOnInit() {
    if (localStorage.getItem('token_chatbot')) {
      this.router.navigate(['/carga-masiva']);
    }
  }

  iniciarSesion() {
    // 1. Validar campos
    if (!this.usuario || !this.clave) {
      Swal.fire({
        icon: 'warning',
        title: 'Faltan datos',
        text: 'Por favor ingresa usuario y contraseña',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    // 2. Bloquear botón
    this.cargando = true;

    const credenciales: UsuarioDTO = {
      nick: this.usuario,
      pass: this.clave
    };

    // 3. Llamada al servicio BLINDADA
    this.authService.login(credenciales)
      .pipe(
        // ESTO ES LO NUEVO: finalize se ejecuta SIEMPRE cuando termina la petición
        // (ya sea con éxito o con error), garantizando que el botón se libere.
        finalize(() => {
          this.cargando = false; 
          this.cd.detectChanges(); // <--- Forzamos a Angular a actualizar la pantalla
        })
      )
      .subscribe({
        next: (resp) => {
          if (resp && resp.exito) {
            this.router.navigate(['/carga-masiva']);
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Acceso Denegado',
              text: resp.mensaje || 'Credenciales incorrectas.',
              confirmButtonColor: '#d33'
            });
          }
        },
        error: (err) => {
          console.error(err);
          const msg = err.error?.mensaje || 'No se pudo conectar con el servidor.';
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: msg,
            confirmButtonColor: '#d33'
          });
        }
      });
  }
}