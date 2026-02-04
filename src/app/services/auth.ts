import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, of } from 'rxjs'; // Importamos 'of'
import { catchError, map } from 'rxjs/operators'; // Importamos operadores
import { UsuarioDTO, RespuestaSesionDTO } from '../models/auth.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  // Tu URL original
  private apiUrl = 'https://localhost:32773/api/Usuario'; 
  
  constructor() { }

  // TU LOGIN ORIGINAL (INTACTO)
  login(credenciales: UsuarioDTO): Observable<RespuestaSesionDTO> {
    return this.http.post<RespuestaSesionDTO>(`${this.apiUrl}/login`, credenciales).pipe(
      tap(respuesta => {
        if (respuesta.exito) {
          localStorage.setItem('token_chatbot', respuesta.token);
        }
      })
    );
  }

  /**
   * ESTA ES LA FUNCIÓN QUE MODIFICAMOS PARA EL GUARD
   * Antes usabas params, ahora usamos Headers para coincidir con el Controller C#
   * Retorna: true (si es válido) o false (si expiró o es inválido)
   */
  validarSesion(): Observable<boolean> {
    const token = this.obtenerToken();
    
    // 1. Si no hay token físico, retornamos false directo
    if (!token) {
        return of(false);
    }

    // 2. C# espera [FromHeader] string token, así que usamos headers
    const headers = new HttpHeaders().set('token', token);

    // 3. Llamamos al endpoint que devuelve 200 o 401
    // Nota: Asegúrate que la ruta '/validar-sesion' coincida con tu [HttpGet] en C#
    return this.http.get(`${this.apiUrl}/validar-sesion`, { headers }).pipe(
      map(() => {
        // Si el servidor responde 200 OK, el token es válido
        return true; 
      }),
      catchError(() => {
        // Si el servidor responde 401 Unauthorized o falla
        this.logout(); // Limpiamos el token basura
        return of(false); // Le decimos al Guard que no deje pasar
      })
    );
  }

  // TUS MÉTODOS UTILITARIOS (INTACTOS)
  logout() {
    localStorage.removeItem('token_chatbot');
  }

  obtenerToken(): string | null {
    return localStorage.getItem('token_chatbot');
  }
  
  estaLogueado(): boolean {
    return !!localStorage.getItem('token_chatbot');
  }
}