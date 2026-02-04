import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionarCobro } from './gestionar-cobro';

describe('GestionarCobro', () => {
  let component: GestionarCobro;
  let fixture: ComponentFixture<GestionarCobro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionarCobro]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionarCobro);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
