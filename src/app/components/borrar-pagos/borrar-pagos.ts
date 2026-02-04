import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CobrosService } from '../../services/cobros';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-borrar-pagos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './borrar-pagos.html',
  styleUrl: './borrar-pagos.css'
})
export class BorrarPagosComponent {
  private cobrosService = inject(CobrosService);
  cargando: boolean = false;

  confirmarBorrado() {
    Swal.fire({
      title: '¿Estás completamente seguro?',
      text: "Esta acción eliminará TODOS los registros de cobros de forma permanente.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, borrar todo',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.ejecutarBorrado();
      }
    });
  }

  private ejecutarBorrado() {
    this.cargando = true;
    this.cobrosService.vaciarTabla().subscribe({
      next: (resp) => {
        this.cargando = false;
        Swal.fire({
          icon: 'success',
          title: '¡Tabla Vaciada!',
          text: `${resp.mensaje}. Registros afectados: ${resp.registrosafectados}`,
          confirmButtonColor: '#28a745'
        });
      },
      error: (err) => {
        this.cargando = false;
        const msg = err.error?.mensaje || 'No se pudo vaciar la tabla.';
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: msg,
          confirmButtonColor: '#d33'
        });
      }
    });
  }
}
