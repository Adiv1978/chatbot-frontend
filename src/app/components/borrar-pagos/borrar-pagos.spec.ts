import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BorrarPagos } from './borrar-pagos';

describe('BorrarPagos', () => {
  let component: BorrarPagos;
  let fixture: ComponentFixture<BorrarPagos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BorrarPagos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BorrarPagos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
