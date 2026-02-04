import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaCobro } from './lista-cobro';

describe('ListaCobro', () => {
  let component: ListaCobro;
  let fixture: ComponentFixture<ListaCobro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaCobro]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaCobro);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
