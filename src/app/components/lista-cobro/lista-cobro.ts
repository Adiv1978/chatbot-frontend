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
        next: (resp: RespuestaCobrosPaginados | any) => {
          const payload = resp?.data ?? resp?.result ?? resp;
          const listaCobros = this.normalizarListaCobros(payload);
          const totalRegistros =
            payload?.totalregistros ??
            payload?.totalRegistros ??
            payload?.TotalRegistros ??
            payload?.total ??
            payload?.Total ??
            0;

          const listaNormalizada = Array.isArray(listaCobros)
            ? listaCobros.map((item) => ({
                ...item,
                id: item?.id ?? item?.Id ?? item?.ID,
                nombre: item?.nombre ?? item?.Nombre ?? item?.NOMBRE,
                monto: item?.monto ?? item?.Monto ?? item?.MONTO
              }))
            : [];

          this.listaCobros = listaNormalizada;
          this.totalRegistros = Number(totalRegistros) || listaNormalizada.length;
        },
        error: (err) => {
          console.error('ERROR EN HTTP:', err);
          Swal.fire('Error', 'El servidor no respondió', 'error');
        }
      });
  }

  private normalizarListaCobros(payload: any): CobroPaginadoDto[] {
    const listaCobrosRaw = Array.isArray(payload)
      ? payload
      : payload?.listacobros ??
        payload?.listaCobros ??
        payload?.ListaCobros ??
        payload?.items ??
        payload?.Items ??
        payload?.data ??
        [];
    if (Array.isArray(listaCobrosRaw)) {
      return listaCobrosRaw;
    }
    if (Array.isArray(listaCobrosRaw?.$values)) {
      return listaCobrosRaw.$values;
    }
    if (Array.isArray(listaCobrosRaw?.values)) {
      return listaCobrosRaw.values;
    }
    return [];
  }

  cargarPrimeraPagina(): void {
    this.paginaActual = 1;
    this.consultarCobros();
  }

  cambiarPagina(n: number): void { this.paginaActual = n; this.consultarCobros(); }
  onTamanoChange(): void {
    this.paginaActual = 1;
    if (this.primeraCargaRealizada) {
      this.consultarCobros();
    }
  }
  get totalPaginas(): number { return Math.ceil(this.totalRegistros / this.tamanoPagina) || 1; }
}
