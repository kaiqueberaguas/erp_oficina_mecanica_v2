using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Pomelo.EntityFrameworkCore.MySql.Scaffolding.Internal;

namespace WebApi.Models;

public partial class OficinaDbContext : DbContext
{
    public OficinaDbContext()
    {
    }

    public OficinaDbContext(DbContextOptions<OficinaDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<TbCarro> TbCarros { get; set; }

    public virtual DbSet<TbCliente> TbClientes { get; set; }

    public virtual DbSet<TbOrdensServico> TbOrdensServicos { get; set; }

    public virtual DbSet<TbUsuario> TbUsuarios { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .UseCollation("utf8mb4_0900_ai_ci")
            .HasCharSet("utf8mb4");

        modelBuilder.Entity<TbCarro>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("tb_carros");

            entity.HasIndex(e => e.ClienteId, "idx_carros_cliente_id");

            entity.HasIndex(e => e.Placa, "uq_carros_placa").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.ClienteId).HasColumnName("cliente_id");
            entity.Property(e => e.Marca)
                .HasMaxLength(50)
                .HasColumnName("marca");
            entity.Property(e => e.Modelo)
                .HasMaxLength(50)
                .HasColumnName("modelo");
            entity.Property(e => e.Placa)
                .HasMaxLength(8)
                .HasColumnName("placa");

            entity.HasOne(d => d.Cliente).WithMany(p => p.TbCarros)
                .HasForeignKey(d => d.ClienteId)
                .HasConstraintName("fk_carros_cliente");
        });

        modelBuilder.Entity<TbCliente>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("tb_clientes");

            entity.HasIndex(e => e.Cpf, "uq_clientes_cpf").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Contato)
                .HasMaxLength(20)
                .HasColumnName("contato");
            entity.Property(e => e.Cpf)
                .HasMaxLength(14)
                .HasColumnName("cpf");
            entity.Property(e => e.Nome)
                .HasMaxLength(100)
                .HasColumnName("nome");
        });

        modelBuilder.Entity<TbOrdensServico>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("tb_ordens_servico");

            entity.HasIndex(e => e.CarroId, "idx_ordens_carro_id");

            entity.HasIndex(e => e.DataEntradaCarro, "idx_ordens_data_entrada");

            entity.HasIndex(e => e.Status, "idx_ordens_status");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CarroId).HasColumnName("carro_id");
            entity.Property(e => e.DataEntradaCarro).HasColumnName("data_entrada_carro");
            entity.Property(e => e.DataFimServico).HasColumnName("data_fim_servico");
            entity.Property(e => e.DataInicioServico).HasColumnName("data_inicio_servico");
            entity.Property(e => e.DataRetiradaVeiculo).HasColumnName("data_retirada_veiculo");
            entity.Property(e => e.DescricaoOrdem)
                .HasColumnType("text")
                .HasColumnName("descricao_ordem");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasColumnName("status");
            entity.Property(e => e.ValorServico)
                .HasPrecision(10, 2)
                .HasColumnName("valor_servico");

            entity.HasOne(d => d.Carro).WithMany(p => p.TbOrdensServicos)
                .HasForeignKey(d => d.CarroId)
                .HasConstraintName("fk_ordens_carro");
        });

        modelBuilder.Entity<TbUsuario>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("tb_usuarios");

            entity.HasIndex(e => e.Login, "uq_usuarios_login").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.DataCriacao)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("datetime")
                .HasColumnName("data_criacao");
            entity.Property(e => e.Login)
                .HasMaxLength(100)
                .HasColumnName("login");
            entity.Property(e => e.Nome)
                .HasMaxLength(100)
                .HasColumnName("nome");
            entity.Property(e => e.SenhaHash)
                .HasMaxLength(255)
                .HasColumnName("senha_hash");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
