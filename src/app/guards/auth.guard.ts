import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth'; // Ajusta la ruta si es necesario
import { tap } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.validarSesion().pipe(
    tap(esValido => {
      if (!esValido) {
        router.navigate(['/login']);
      }
    })
  );
};