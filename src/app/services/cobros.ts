import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
// Importamos los DTOs. Asegúrate de tenerlos definidos en models/cobros.models.ts
import { CobroDTO, RespuestaOperacionDTO, RespuestaCobrosPaginados,CobroListaDTO } from '../models/cobros.models';

@Injectable({
  providedIn: 'root'
})
export class CobrosService {
  // Inyección moderna de dependencias
  private http = inject(HttpClient);

  // URL BASE: Ajusta el puerto (7152, 5000, etc.) según tu launchSettings.json de .NET
  private apiUrl = 'https://localhost:32775/api/cobros'; 

  constructor() { }

  // ==========================================
  // HELPER PRIVADO: Obtener Token Manualmente
  // ==========================================
  private obtenerCabeceras(): HttpHeaders {
    const token = localStorage.getItem('token_chatbot') || '';
    // IMPORTANTE: Usamos 'token' como clave porque en tu Controller de C# 
    // definiste: [FromHeader] string token
    return new HttpHeaders().set('token', token);
  }

  // ==========================================
  // MÉTODOS DE LA API
  // ==========================================

  /**
   * 1. CARGA MASIVA (Desde CSV)
   * Endpoint: POST api/cobros/cargar-masiva
   */
  cargarMasiva(lista: CobroDTO[]): Observable<RespuestaOperacionDTO> {
    const headers = this.obtenerCabeceras();
    return this.http.post<RespuestaOperacionDTO>(
      `${this.apiUrl}/cargar-masiva`, 
      lista, 
      { headers }
    );
  }

  /**
   * 2. OBTENER LISTADO PAGINADO (Para la Grilla)
   * Endpoint: GET api/cobros/listar-paginado?pagina=1&tamano=10
   */
  obtenerCobrosPaginados(pagina: number = 1, tamano: number = 10): Observable<RespuestaCobrosPaginados> {
    const headers = this.obtenerCabeceras();
    
    // Configuramos los parámetros de la URL
    const params = new HttpParams()
      .set('pagina', pagina)
      .set('tamano', tamano);

    return this.http.get<RespuestaCobrosPaginados>(
      `${this.apiUrl}/listar-paginado`, 
      { headers, params }
    );
  }

  /**
   * 3. ACTUALIZAR STATUS (Por teléfono)
   * Endpoint: PUT api/cobros/actualizar-status
   */
actualizarStatus(lista: CobroDTO[]): Observable<any> {
    const headers = this.obtenerCabeceras();
    return this.http.put(`${this.apiUrl}/actualizar-status`, lista, { headers });
  }

  /**
   * 4. PROCESAR ACTUALIZACIÓN MASIVA (Con Semáforo en Backend)
   * Endpoint: POST api/cobros/actualizar-masivo
   */
  procesarActualizacionMasiva(datos: RespuestaCobrosPaginados): Observable<RespuestaOperacionDTO> {
    const headers = this.obtenerCabeceras();
    return this.http.post<RespuestaOperacionDTO>(
      `${this.apiUrl}/actualizar-masivo`, 
      datos, 
      { headers }
    );
  }

  buscarPorTelefono(telefono: string): Observable<CobroListaDTO[]> {
    const headers = this.obtenerCabeceras(); // Reutilizamos tu lógica de token manual
    
    // Codificamos el teléfono por si tiene espacios o caracteres especiales
    const telefonoSafe = encodeURIComponent(telefono.trim());
    
    return this.http.get<CobroListaDTO[]>(
      `${this.apiUrl}/buscar/${telefonoSafe}`, 
      { headers }
    );
  }

  vaciarTabla(): Observable<RespuestaOperacionDTO> {
    const headers = this.obtenerCabeceras();
    return this.http.delete<RespuestaOperacionDTO>(
      `${this.apiUrl}/vaciar-tabla`, 
      { headers }
    );
  }

}
