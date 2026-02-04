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
  private cd = inject(ChangeDetectorRef); // Inyección para forzar actualización de vista

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
    
    // Limpiamos la lista mientras carga para evitar confusión visual
    this.listaCobros = []; 

    this.cobrosService
      .obtenerCobrosPaginados(this.paginaActual, this.tamanoPagina)
      .pipe(
        timeout(15000),
        finalize(() => {
          this.cargando = false;
          this.cd.detectChanges(); // Forzamos actualización al terminar
        })
      )
      .subscribe({
        next: (resp: any) => {
          console.log('1. Respuesta Backend:', resp);

          // 1. Extraer el objeto principal
          const payload = resp?.data ?? resp?.result ?? resp;

          // 2. Extraer el array (buscamos listacobros en minúscula explícitamente)
          const itemsRaw = this.normalizarListaCobros(payload);
          console.log(`2. Items extraídos (${itemsRaw.length}):`, itemsRaw);

          // 3. Extraer el total
          const totalRegistros =
            payload?.totalregistros ??
            payload?.totalRegistros ??
            payload?.TotalRegistros ??
            payload?.total ??
            itemsRaw.length;

          // 4. Normalizar propiedades (Mapeo seguro)
          const listaNormalizada = itemsRaw.map((item: any) => {
            return {
              // Copiamos todo lo que venga
              ...item,
              // Forzamos las propiedades que usa el HTML
              id: item.id || item.Id || item.ID || 0,
              nombre: item.nombre || item.Nombre || item.NOMBRE || 'Sin Nombre',
              // Si 'monto' no viene en el JSON, ponemos 0 para que no falle
              monto: item.monto || item.Monto || item.MONTO || 0,
              // Mapeamos fecReg por si acaso (noté que viene como 'fecreg')
              fecReg: item.fecreg || item.fecReg || item.FecReg || ''
            };
          });

          console.log('3. Lista Normalizada Final:', listaNormalizada);

          // 5. Asignar y detectar cambios
          this.listaCobros = listaNormalizada;
          this.totalRegistros = Number(totalRegistros) || 0;
          
          // Forzar a Angular a pintar los cambios
          this.cd.detectChanges();
        },
        error: (err) => {
          console.error('ERROR EN HTTP:', err);
          Swal.fire('Error', 'El servidor no respondió', 'error');
        }
      });
  }

  private normalizarListaCobros(payload: any): any[] {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;

    // Buscamos la propiedad con todas las variantes posibles
    const lista =
      payload.listacobros || // Caso exacto de tu JSON (minúsculas)
      payload.listaCobros ||
      payload.ListaCobros ||
      payload.items ||
      payload.Items ||
      payload.data ||
      payload.$values || 
      payload.values;

    return Array.isArray(lista) ? lista : [];
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