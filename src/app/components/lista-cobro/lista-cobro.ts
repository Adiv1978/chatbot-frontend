import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CobrosService } from '../../services/cobros';
import { CobroPaginadoDto } from '../../models/cobros.models';
import Swal from 'sweetalert2';
import { finalize, timeout } from 'rxjs/operators';

@Component({
  selector: 'app-lista-cobro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-cobro.html',
  styleUrl: './lista-cobro.css'
})
export class ListaCobroComponent implements OnInit {
  private cobrosService = inject(CobrosService);
  private cd = inject(ChangeDetectorRef);

  listaCobros: CobroPaginadoDto[] = [];
  
  // Variables de paginación y estado
  totalRegistros: number = 0;
  totalPaginas: number = 0; // Guardamos la cantidad de páginas
  cargando: boolean = false;
  primeraCargaRealizada: boolean = false;

  paginaActual: number = 1;
  tamanoPagina: number = 20;

  ngOnInit(): void {
    this.primeraCargaRealizada = false;
    // Opcional: Cargar datos al inicio
    // this.consultarCobros(); 
  }

  consultarCobros(): void {
    this.cargando = true;
    this.primeraCargaRealizada = true;
    this.listaCobros = []; 

    this.cobrosService
      .obtenerCobrosPaginados(this.paginaActual, this.tamanoPagina)
      .pipe(
        timeout(15000),
        finalize(() => {
          this.cargando = false;
          this.cd.detectChanges();
        })
      )
      .subscribe({
        next: (resp: any) => {
          const payload = resp?.data ?? resp?.result ?? resp;
          const itemsRaw = this.normalizarListaCobros(payload);

          // Obtener total de registros
          const totalRegistros =
            payload?.totalregistros ??
            payload?.totalRegistros ??
            payload?.TotalRegistros ??
            payload?.total ??
            itemsRaw.length;

          this.totalRegistros = Number(totalRegistros) || 0;

          // Calcular y guardar cantidad de páginas
          this.totalPaginas = this.tamanoPagina > 0 
            ? Math.ceil(this.totalRegistros / this.tamanoPagina) 
            : 1;

          // Mapeo seguro de datos incluyendo teléfono y dirección
          this.listaCobros = itemsRaw.map((item: any) => ({
            ...item,
            id: item.id || item.Id || item.ID || 0,
            nombre: item.nombre || item.Nombre || item.NOMBRE || 'Sin Nombre',
            telefono: item.telefono || item.Telefono || item.TELEFONO || '',
            direccion: item.direccion || item.Direccion || item.DIRECCION || '',
            monto: item.monto || item.Monto || item.MONTO || 0,
            fecReg: item.fecreg || item.fecReg || item.FecReg || ''
          }));
          
          this.cd.detectChanges();
        },
        error: (err) => {
          console.error('ERROR:', err);
          Swal.fire('Error', 'El servidor no respondió', 'error');
        }
      });
  }

  private normalizarListaCobros(payload: any): any[] {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    const lista = payload.listacobros || payload.listaCobros || payload.items || payload.data || payload.$values;
    return Array.isArray(lista) ? lista : [];
  }

  // --- MÉTODOS DE PAGINACIÓN ---

  // Evento para el input de tamaño (Solo al presionar Enter o Blur)
  onTamanoChange(): void {
    // Validamos que sea al menos 1
    if (this.tamanoPagina < 1) this.tamanoPagina = 1;
    this.paginaActual = 1; // Reiniciar a página 1 al cambiar tamaño
    this.consultarCobros();
  }

  cargarPrimeraPagina(): void {
    this.paginaActual = 1;
    this.consultarCobros();
  }

  siguientePagina(): void {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
      this.consultarCobros();
    }
  }

  anteriorPagina(): void {
    if (this.paginaActual > 1) {
      this.paginaActual--;
      this.consultarCobros();
    }
  }
}