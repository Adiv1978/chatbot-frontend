import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlantillaService } from '../../services/plantilla';
import { PlantillaDto, PlantillaRequest } from '../../models/plantilla.models';

@Component({
  selector: 'app-gestion-plantilla',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-plantilla.html',
  styleUrls: ['./gestion-plantilla.css']
})
export class GestionPlantillaComponent implements OnInit {
  private plantillaService = inject(PlantillaService);

  nuevaPlantilla: PlantillaRequest = { nombre: '', contenido: '' };
  listaPlantillas: PlantillaDto[] = [];

  ngOnInit() {
    this.cargarPlantillas();
  }

  cargarPlantillas() {
    this.plantillaService.listar().subscribe({
      next: (data) => this.listaPlantillas = data,
      error: (err) => console.error('Error al cargar plantillas', err)
    });
  }

  insertarTag(tag: string) {
    this.nuevaPlantilla.contenido += ` ${tag}`;
  }

  guardar() {
    if (!this.nuevaPlantilla.nombre.trim() || !this.nuevaPlantilla.contenido.trim()) return;
    this.plantillaService.insertar(this.nuevaPlantilla).subscribe({
      next: (res) => {
        if (res.exito) {
          this.nuevaPlantilla = { nombre: '', contenido: '' };
          this.cargarPlantillas();
        }
      }
    });
  }

  borrar(id: number) {
    if (confirm('¿Desea eliminar esta plantilla?')) {
      this.plantillaService.eliminar(id).subscribe({
        next: () => this.cargarPlantillas()
      });
    }
  }
}