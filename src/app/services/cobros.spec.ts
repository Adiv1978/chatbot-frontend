import { TestBed } from '@angular/core/testing';

import { Cobros } from './cobros';

describe('Cobros', () => {
  let service: Cobros;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Cobros);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
