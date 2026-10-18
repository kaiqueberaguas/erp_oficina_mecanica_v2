namespace WebApi.Models;

/// <summary>
/// Etapas de uma ordem de serviço. Uma ordem só pode avançar para uma etapa de número maior
/// que a atual, não necessariamente a seguinte (ex.: EmAndamento → Cancelada).
/// </summary>
public enum EtapaOrdem : byte
{
    Rascunho = 1,
    Inicio = 2,
    EmAndamento = 3,
    Finalizada = 4,
    Cancelada = 5,
}
