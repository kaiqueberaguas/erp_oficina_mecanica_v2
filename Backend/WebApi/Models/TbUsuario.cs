using System;
using System.Collections.Generic;

namespace WebApi.Models;

public partial class TbUsuario
{
    public int Id { get; set; }

    public string Nome { get; set; } = null!;

    public string Login { get; set; } = null!;

    public string SenhaHash { get; set; } = null!;

    public DateTime DataCriacao { get; set; }
}
