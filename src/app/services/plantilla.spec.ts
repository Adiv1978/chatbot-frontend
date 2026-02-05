import { TestBed } from '@angular/core/testing';

import { Plantilla } from './plantilla';

describe('Plantilla', () => {
  let service: Plantilla;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Plantilla);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
