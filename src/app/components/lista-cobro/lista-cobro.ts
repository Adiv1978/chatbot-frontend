import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CobrosService } from '../../services/cobros';
import { RespuestaCobrosPaginados } from '../../models/cobros.models';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-lista-cobro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-cobro.html',
  styleUrl: './lista-cobro.css'
})
export class ListaCobroComponent {
  private cobrosService = inject(CobrosService);

  listaCobros: any[] = []; // Usamos any temporalmente para descartar errores de modelo
  totalRegistros: number = 0;
  cargando: boolean = false;
  primeraCargaRealizada: boolean = false;

  paginaActual: number = 1;
  tamanoPagina: number = 20;

  consultarCobros(): void {
    // PRUEBA DE FUEGO: Esto debe aparecer SIEMPRE
    console.log('%c >>> BOTON PRESIONADO <<<', 'color: white; background: red; padding: 5px;');
    alert('Click detectado en el componente'); 

    this.cargando = true;
    this.primeraCargaRealizada = true;

    this.cobrosService.obtenerCobrosPaginados(this.paginaActual, this.tamanoPagina).subscribe({
      next: (resp: any) => {
        console.log('DATOS RECIBIDOS:', resp);
        
        // Mapeo flexible para ver qué funciona
        this.listaCobros = resp.ListaCobros || resp.listaCobros || [];
        this.totalRegistros = resp.TotalRegistros || resp.totalRegistros || 0;
        
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