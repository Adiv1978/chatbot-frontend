import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CobrosService } from '../../services/cobros';
import { CobroPaginadoDto, RespuestaCobrosPaginados } from '../../models/cobros.models';
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

  listaCobros: CobroPaginadoDto[] = [];
  totalRegistros: number = 0;
  cargando: boolean = false;
  primeraCargaRealizada: boolean = false;

  paginaActual: number = 1;
  tamanoPagina: number = 20;

  ngOnInit(): void {
    this.primeraCargaRealizada = false;
  }

  consultarCobros(): void {
    this.cargando = true;
    this.primeraCargaRealizada = true;

    this.cobrosService
      .obtenerCobrosPaginados(this.paginaActual, this.tamanoPagina)
      .pipe(
        timeout(15000),
        finalize(() => {
          this.cargando = false;
        })
      )
      .subscribe({
        next: (resp: any) => {
          console.log('Respuesta cruda del backend:', resp);

          // 1. Identificar dónde está la información principal
          const payload = resp?.data ?? resp?.result ?? resp;

          // 2. Obtener el array de items usando el helper
          const itemsRaw = this.normalizarListaCobros(payload);

          // 3. Calcular el total de registros buscando variantes de nombre
          const totalRegistros =
            payload?.totalregistros ??
            payload?.totalRegistros ??
            payload?.TotalRegistros ??
            payload?.total ??
            payload?.Total ??
            itemsRaw.length;

          // 4. Normalizar cada objeto para asegurar que id, nombre y monto existan
          //    (Mapea PascalCase, UPPERCASE o camelCase a las propiedades que espera el HTML)
          const listaNormalizada = itemsRaw.map((item: any) => ({
            ...item,
            id: item?.id ?? item?.Id ?? item?.ID,
            nombre: item?.nombre ?? item?.Nombre ?? item?.NOMBRE,
            monto: item?.monto ?? item?.Monto ?? item?.MONTO
          }));

          // 5. Asignar al estado del componente
          this.listaCobros = listaNormalizada;
          this.totalRegistros = Number(totalRegistros) || 0;
        },
        error: (err) => {
          console.error('ERROR EN HTTP:', err);
          Swal.fire('Error', 'El servidor no respondió o hubo un error en la petición', 'error');
        }
      });
  }

  /**
   * Helper para extraer el array de cobros de estructuras complejas o anidadas.
   */
  private normalizarListaCobros(payload: any): any[] {
    // Si el payload mismo ya es un array, devolverlo directamente
    if (Array.isArray(payload)) {
      return payload;
    }

    // Buscar la propiedad que contenga la lista
    const lista =
      payload?.listacobros ??
      payload?.listaCobros ??
      payload?.ListaCobros ??
      payload?.items ??
      payload?.Items ??
      payload?.data ??
      payload?.$values ?? // Estructura común en serialización .NET con referencias circulares
      payload?.values;

    if (Array.isArray(lista)) {
      return lista;
    }
    
    // Si llegamos aquí, retornamos array vacío
    return [];
  }

  cargarPrimeraPagina(): void {
    this.paginaActual = 1;
    this.consultarCobros();
  }

  cambiarPagina(n: number): void { 
    this.paginaActual = n; 
    this.consultarCobros(); 
  }

  onTamanoChange(): void {
    this.paginaActual = 1;
    if (this.primeraCargaRealizada) {
      this.consultarCobros();
    }
  }

  get totalPaginas(): number { 
    if (this.tamanoPagina <= 0) return 1;
    return Math.ceil(this.totalRegistros / this.tamanoPagina) || 1; 
  }
}