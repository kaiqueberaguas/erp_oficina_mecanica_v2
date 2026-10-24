import { TestBed } from '@angular/core/testing';
import { EtapaOrdem } from '../../models/ordem';
import { STATUS_ORDEM, StatusBadge } from './status-badge';

describe('StatusBadge', () => {
  it.each([
    [EtapaOrdem.Rascunho, 'Rascunho'],
    [EtapaOrdem.Inicio, 'Início'],
    [EtapaOrdem.EmAndamento, 'Em andamento'],
    [EtapaOrdem.Finalizada, 'Finalizada'],
    [EtapaOrdem.Cancelada, 'Cancelada'],
  ])('mostra o rótulo da etapa %i', (etapa, rotulo) => {
    const fixture = TestBed.createComponent(StatusBadge);
    fixture.componentRef.setInput('etapa', etapa);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(rotulo);
    expect(STATUS_ORDEM[etapa].rotulo).toBe(rotulo);
  });
});
