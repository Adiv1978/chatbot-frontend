import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CobrosService } from '../../services/cobros'; 
import { CobroDTO } from '../../models/cobros.models';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cobros-carga-masiva',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cobros-carga-masiva.html',
  styleUrl: './cobros-carga-masiva.css'
})
export class CobrosCargaMasivaComponent {
  private cobrosService = inject(CobrosService);
  private cd = inject(ChangeDetectorRef);

  mensaje: string = '';
  tipoMensaje: 'exito' | 'error' | '' = '';
  cargando: boolean = false;
  registrosPrevios: CobroDTO[] = [];

  // --- PROPIEDADES DE PAGINACIÓN ---
  paginaActual: number = 1;
  readonly itemsPorPagina: number = 20;

  // Calcula el total de páginas basado en los registros cargados
  get totalPaginas(): number {
    return Math.ceil(this.registrosPrevios.length / this.itemsPorPagina);
  }

  // Retorna solo el segmento de datos que corresponde a la página actual
  get registrosPaginados(): CobroDTO[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.registrosPrevios.slice(inicio, fin);
  }

  onFileChange(event: any) {
    const archivo = event.target.files[0];
    if (!archivo) return;

    this.mensaje = 'Leyendo archivo...';
    this.cargando = true;
    this.paginaActual = 1; // Resetear a la primera página al cargar nuevo archivo
    
    const reader = new FileReader();
    
    reader.onload = (e: any) => {
      setTimeout(() => {
          this.procesarCSV(e.target.result);
          event.target.value = ''; 
      }, 100);
    };

    reader.onerror = (err) => {
      console.error("Error lectura:", err);
      this.mensaje = 'Error al leer el archivo local.';
      this.cargando = false;
    };

    reader.readAsText(archivo);
  }

  procesarCSV(texto: string) {
    this.registrosPrevios = []; 
    
    try {
      const textoNormalizado = texto.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      const lineas = textoNormalizado.split('\n');

      if (lineas.length < 2) {
          throw new Error("El archivo está vacío o no tiene formato correcto.");
      }

      for (let i = 1; i < lineas.length; i++) {
        try {
            let linea = lineas[i].trim();
            if (!linea) continue;

            if (linea.startsWith('"')) linea = linea.substring(1);
            if (linea.endsWith('"')) linea = linea.substring(0, linea.length - 1);

            const cols = linea.split('","');
            const nombre = cols[3] ? cols[3].trim() : '';
            if (!nombre) continue;

            this.registrosPrevios.push({
                id: 0,
                nombre: nombre,
                direccion: cols[14] || '',
                telefono: cols[18] || '',
                monto: this.parsearMontoSeguro(cols[8]),
                fecCaduca: this.parsearFechaSegura(cols[6]),
                isenviado: false,
                ispagado: this.verificarPago(cols[20])
            });

        } catch (errorFila) {
            console.warn(`Error en fila ${i}`, errorFila);
        }
      }

      if (this.registrosPrevios.length > 0) {
        this.mensaje = `Vista Previa: ${this.registrosPrevios.length} registros listos.`;
        this.tipoMensaje = 'exito';
      } else {
        this.mensaje = 'No se encontraron datos válidos en el archivo.';
        this.tipoMensaje = 'error';
      }

    } catch (err: any) {
      this.mensaje = `Error procesando CSV: ${err.message}`;
      this.tipoMensaje = 'error';
    } finally {
      this.cargando = false;
      this.cd.detectChanges();
    }
  }

  // --- NAVEGACIÓN ---
  cambiarPagina(nuevaPagina: number) {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas) {
      this.paginaActual = nuevaPagina;
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Opcional: subir scroll al cambiar
    }
  }

  enviarDatos() {
    if (this.registrosPrevios.length === 0) return;

    this.cargando = true;
    this.mensaje = 'Enviando datos al servidor...';

    this.cobrosService.cargarMasiva(this.registrosPrevios).subscribe({
      next: (resp) => {
        this.cargando = false;
        Swal.fire({
            icon: 'success',
            title: '¡Carga Exitosa!',
            text: resp.mensaje || 'Los cobros se han guardado correctamente.',
            confirmButtonColor: '#28a745'
        });

        this.registrosPrevios = []; 
        this.paginaActual = 1;
        this.mensaje = 'Esperando nuevo archivo...'; 
        this.tipoMensaje = '';
        this.cd.detectChanges();
      },
      error: (err) => {
        this.cargando = false;
        const mensajeError = err.error?.mensaje || err.message || 'Error desconocido del servidor';
        Swal.fire({
            icon: 'error',
            title: 'Error en la Carga',
            text: mensajeError,
            confirmButtonColor: '#d33'
        });
        this.mensaje = 'Error al enviar. Intente nuevamente.';
        this.tipoMensaje = 'error';
      }
    });
  }

  private parsearMontoSeguro(val: string | undefined): number {
    if (!val) return 0;
    try {
        const limpio = val.replace(/[^0-9.-]/g, '');
        const num = parseFloat(limpio);
        return isNaN(num) ? 0 : num;
    } catch { return 0; }
  }

  private parsearFechaSegura(val: string | undefined): string {
    const getFechaDefault = () => {
        const d = new Date();
        d.setDate(d.getDate() + 5);
        return d.toISOString();
    };
    if (!val || val.trim() === '' || val.includes('00/00/0000')) return getFechaDefault();
    try {
        const partes = val.split('/');
        if (partes.length === 3) return `${partes[2]}-${partes[1]}-${partes[0]}T00:00:00`;
        return getFechaDefault();
    } catch { return getFechaDefault(); }
  }

  private verificarPago(val: string | undefined): boolean {
    if (!val) return false;
    const t = val.toUpperCase();
    return t.includes('PAGADO') && !t.includes('NO');
  }
}