using System;
using System.Collections.Generic;

namespace WebApi.Models;

public partial class TbCliente
{
    public int Id { get; set; }

    public string Nome { get; set; } = null!;

    public string Cpf { get; set; } = null!;

    public string Contato { get; set; } = null!;

    public virtual ICollection<TbCarro> TbCarros { get; set; } = new List<TbCarro>();
}
