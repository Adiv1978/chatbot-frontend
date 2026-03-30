import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CobrosService } from '../../services/cobros';
import { CobroListaDTO, CobroDTO } from '../../models/cobros.models';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-enviar-whatsapp',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './enviar-whatsapp.html',
  styleUrl: './enviar-whatsapp.css'
})
export class EnviarWhatsappComponent {
  private cobrosService = inject(CobrosService);
  private cd = inject(ChangeDetectorRef);

  telefonoBusqueda: string = '';
  cargando: boolean = false;
  listaResultados: CobroListaDTO[] = [];
  fechaCaducidadGlobal: string = '';
  fechaEmisionGlobal: string = '';

  buscar() {
    if (!this.telefonoBusqueda || this.telefonoBusqueda.trim().length < 6) {
      Swal.fire('Atención', 'Ingresa un número de teléfono válido.', 'warning');
      return;
    }

    this.cargando = true;

    this.cobrosService.buscarPorTelefono(this.telefonoBusqueda).subscribe({
      next: (res) => {
        setTimeout(() => {
          // MAPEO DIRECTO (Ya coinciden los nombres)
          this.listaResultados = res.map((item: any) => ({
            ...item,
            monto: Number(item.monto),
            fecCaduca: item.feccaduca || item.fecCaduca || item.FecCaduca || '',
            fecEmitido: item.fecemitido || item.fecEmitido || item.FecEmitido || '',
            // Ahora leemos directo la minúscula
            ispagado: !!item.ispagado, 
            isenviado: !!item.isenviado
          }));
          console.log(this.listaResultados);
          this.cargando = false;
          this.cd.detectChanges();

          if (this.listaResultados.length === 0) {
            Swal.fire('Sin resultados', 'No se encontraron cobros.', 'info');
          }
        }, 0);
      },
      error: (err) => {
        setTimeout(() => {
          this.cargando = false;
          this.cd.detectChanges();
          if (err.status === 404) {
             this.listaResultados = [];
             Swal.fire('Aviso', 'No hay datos.', 'info');
          } else {
             Swal.fire('Error', 'Error al buscar.', 'error');
          }
        }, 0);
      }
    });
  }

  togglePago(item: CobroListaDTO) {
    if (this.cargando) return;
    
    // CAMBIO A MINÚSCULA
    item.ispagado = !item.ispagado; 
  }

  aplicarFechasATodos() {
    if (this.listaResultados.length === 0) {
      Swal.fire('Atención', 'No hay elementos para actualizar.', 'warning');
      return;
    }

    if (!this.fechaCaducidadGlobal || !this.fechaEmisionGlobal) {
      Swal.fire('Atención', 'Debes indicar la fecha de emisión y la fecha de caducidad.', 'warning');
      return;
    }

    this.listaResultados = this.listaResultados.map((item) => ({
      ...item,
      fecEmitido: this.fechaEmisionGlobal,
      fecCaduca: this.fechaCaducidadGlobal
    }));

    Swal.fire('Listo', 'Las fechas se aplicaron a todos los elementos.', 'success');
  }

  guardarCambios() {
    if (this.listaResultados.length === 0) return;

    Swal.fire({
      title: '¿Confirmar cambios?',
      text: "Se actualizarán los montos y estados.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.ejecutarGuardado();
      }
    });
  }

  private ejecutarGuardado() {
    this.cargando = true;

    // Convertimos al DTO de envío usando MINÚSCULAS
    const listaParaEnviar: CobroDTO[] = this.listaResultados.map(item => ({
      id: item.id,
      nombre: item.nombre,
      direccion: item.direccion,
      telefono: item.telefono,
      monto: Number(item.monto),
      fecCaduca: item.fecCaduca, // Ojo con esta fecha si el backend la pide 'feccaduca'
      fecEmitido: item.fecEmitido,
      isenviado: item.isenviado,
      ispagado: item.ispagado
    }));

    this.cobrosService.actualizarStatus(listaParaEnviar).subscribe({
      next: (resp) => {
        setTimeout(() => {
          this.cargando = false;
          this.cd.detectChanges();
          Swal.fire('¡Actualizado!', resp.mensaje || 'Guardado correctamente.', 'success');
        }, 0);
      },
      error: (err) => {
        setTimeout(() => {
          this.cargando = false;
          this.cd.detectChanges();
          const msg = err.error?.mensaje || 'Error desconocido.';
          Swal.fire('Error', msg, 'error');
        }, 0);
      }
    });
  }
}
