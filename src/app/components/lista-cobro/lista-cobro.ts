import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CobrosService } from '../../services/cobros';
import { CobroPaginadoDto, RespuestaCobrosPaginados } from '../../models/cobros.models';
import Swal from 'sweetalert2';

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
    this.consultarCobros();
  }

  consultarCobros(): void {
    this.cargando = true;
    this.primeraCargaRealizada = true;

    this.cobrosService.obtenerCobrosPaginados(this.paginaActual, this.tamanoPagina).subscribe({
      next: (resp: RespuestaCobrosPaginados | any) => {
        const payload = resp?.data ?? resp?.result ?? resp;
        const listaCobros =
          payload?.listacobros ??
          payload?.listaCobros ??
          payload?.ListaCobros ??
          payload?.items ??
          payload?.Items ??
          [];
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
        this.cargando = false;
      },
      error: (err) => {
        console.error('ERROR EN HTTP:', err);
        this.cargando = false;
        Swal.fire('Error', 'El servidor no respondió', 'error');
      }
    });
  }

  // Métodos simplificados
  cambiarPagina(n: number) { this.paginaActual = n; this.consultarCobros(); }
  onTamanoChange() { this.paginaActual = 1; this.consultarCobros(); }
  get totalPaginas(): number { return Math.ceil(this.totalRegistros / this.tamanoPagina) || 1; }
}
