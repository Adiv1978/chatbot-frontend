import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnviarWhatsappComponent } from './enviar-whatsapp';

describe('EnviarWhatsappComponent', () => {
  let component: EnviarWhatsappComponent;
  let fixture: ComponentFixture<EnviarWhatsappComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnviarWhatsappComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnviarWhatsappComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
