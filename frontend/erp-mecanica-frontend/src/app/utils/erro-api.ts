import { HttpErrorResponse } from '@angular/common/http';

/**
 * Extrai a mensagem a exibir de um erro da API: primeira mensagem de validação (`errors`),
 * senão o `title` do ProblemDetails (exceções de domínio), senão um texto padrão.
 */
export function mensagemErro(
  erro: unknown,
  padrao = 'Não foi possível concluir a operação.',
): string {
  if (!(erro instanceof HttpErrorResponse)) return padrao;
  if (erro.status === 0) return 'Sem conexão com o servidor.';

  const corpo = erro.error;
  const validacao = Object.values(corpo?.errors ?? {}).flat()[0];
  if (typeof validacao === 'string') return validacao;
  if (typeof corpo?.title === 'string') return corpo.title;
  return padrao;
}
