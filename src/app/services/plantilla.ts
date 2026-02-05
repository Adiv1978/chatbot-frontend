import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PlantillaRequest, PlantillaDto } from '../models/plantilla.models';
import { RespuestaOperacionDTO } from '../models/cobros.models';

@Injectable({
  providedIn: 'root'
})
export class PlantillaService {
  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:32771/api/Plantilla'; // Ajustar puerto según tu backend

  private obtenerCabeceras(): HttpHeaders {
    const token = localStorage.getItem('token_chatbot') || '';
    return new HttpHeaders().set('token', token);
  }

  insertar(datos: PlantillaRequest): Observable<RespuestaOperacionDTO> {
    return this.http.post<RespuestaOperacionDTO>(`${this.apiUrl}/insertar`, datos, { headers: this.obtenerCabeceras() });
  }

  listar(): Observable<PlantillaDto[]> {
    return this.http.get<PlantillaDto[]>(`${this.apiUrl}/listar`, { headers: this.obtenerCabeceras() });
  }

  eliminar(id: number): Observable<RespuestaOperacionDTO> {
    return this.http.delete<RespuestaOperacionDTO>(`${this.apiUrl}/eliminar/${id}`, { headers: this.obtenerCabeceras() });
  }
}
