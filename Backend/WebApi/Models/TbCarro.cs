using System;
using System.Collections.Generic;

namespace WebApi.Models;

public partial class TbCarro
{
    public int Id { get; set; }

    public int ClienteId { get; set; }

    public string Marca { get; set; } = null!;

    public string Modelo { get; set; } = null!;

    public string Placa { get; set; } = null!;

    public virtual TbCliente Cliente { get; set; } = null!;

    public virtual ICollection<TbOrdensServico> TbOrdensServicos { get; set; } = new List<TbOrdensServico>();
}
