using EgyptianLawyers.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EgyptianLawyers.Api.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Lawyer> Lawyers => Set<Lawyer>();
    public DbSet<Court> Courts => Set<Court>();
    public DbSet<City> Cities => Set<City>();
    public DbSet<HelpPost> HelpPosts => Set<HelpPost>();
    public DbSet<HelpPostReply> HelpPostReplies => Set<HelpPostReply>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Court>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(200);
        });

        modelBuilder.Entity<City>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(200);

            entity.HasOne(e => e.Court)
                .WithMany(c => c.Cities)
                .HasForeignKey(e => e.CourtId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Lawyer>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FullName).HasMaxLength(200);
            entity.Property(e => e.Title).HasMaxLength(100);
            entity.Property(e => e.SyndicateCardNumber).HasMaxLength(50);
            entity.Property(e => e.WhatsAppNumber).HasMaxLength(20);
            entity.Property(e => e.IsVerified).HasDefaultValue(false);
        });

        modelBuilder.Entity<HelpPost>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Description).HasMaxLength(2000);
            entity.Property(e => e.AttachmentUrl).HasMaxLength(1000);

            entity.HasOne(e => e.Court)
                .WithMany(c => c.HelpPosts)
                .HasForeignKey(e => e.CourtId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.City)
                .WithMany(c => c.HelpPosts)
                .HasForeignKey(e => e.CityId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Lawyer)
                .WithMany(l => l.HelpPosts)
                .HasForeignKey(e => e.LawyerId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<HelpPostReply>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Comment).HasMaxLength(2000);
            entity.Property(e => e.AttachmentUrl).HasMaxLength(1000);

            entity.HasOne(e => e.HelpPost)
                .WithMany(p => p.Replies)
                .HasForeignKey(e => e.HelpPostId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Lawyer)
                .WithMany(l => l.HelpPostReplies)
                .HasForeignKey(e => e.LawyerId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Lawyer>()
            .HasMany(l => l.ActiveCities)
            .WithMany(c => c.ActiveLawyers)
            .UsingEntity(j =>
            {
                j.ToTable("LawyerActiveCities");
            });
    }
}
