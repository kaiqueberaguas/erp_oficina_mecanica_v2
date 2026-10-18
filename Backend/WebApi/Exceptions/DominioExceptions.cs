namespace WebApi.Exceptions;

// Bases mapeadas para HTTP pelo DominioExceptionFilter.
public class NaoEncontradoException(string mensagem) : Exception(mensagem);                 // 404

public class ConflitoException(string mensagem) : Exception(mensagem);                      // 409

public class RegraNegocioException(string mensagem) : Exception(mensagem);                  // 400

public class CpfDuplicadoException() : ConflitoException("Já existe um cliente cadastrado com este CPF.");

public class PlacaDuplicadaException() : ConflitoException("Já existe um carro cadastrado com esta placa.");

public class CpfInvalidoException() : RegraNegocioException("CPF inválido.");

public class PlacaInvalidaException() : RegraNegocioException("Placa inválida. Use o formato ABC-1234 ou ABC1D23.");

public class TransicaoEtapaInvalidaException(string atual, string nova)
    : RegraNegocioException($"A ordem está em '{atual}' e só pode avançar para uma etapa posterior (solicitado: '{nova}').");
