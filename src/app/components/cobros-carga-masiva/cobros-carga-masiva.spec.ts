import { ComponentFixture, TestBed } from '@angular/core/testing';
// Corrección 1: Importar la clase con el nombre correcto
import { CobrosCargaMasivaComponent } from './cobros-carga-masiva';

describe('CobrosCargaMasivaComponent', () => {
  let component: CobrosCargaMasivaComponent;
  let fixture: ComponentFixture<CobrosCargaMasivaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Corrección 2: Usar imports porque es un componente standalone
      imports: [CobrosCargaMasivaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CobrosCargaMasivaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});