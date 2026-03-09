using EgyptianLawyers.Api.Domain.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace EgyptianLawyers.Api.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options) { }

    public DbSet<Lawyer> Lawyers => Set<Lawyer>();
    public DbSet<Court> Courts => Set<Court>();
    public DbSet<City> Cities => Set<City>();
    public DbSet<HelpPost> HelpPosts => Set<HelpPost>();
    public DbSet<HelpPostReply> HelpPostReplies => Set<HelpPostReply>();
    public DbSet<UserNotification> UserNotifications => Set<UserNotification>();
    public DbSet<ProfileView> ProfileViews => Set<ProfileView>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<City>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
            entity.Property(e => e.IsDeleted).HasDefaultValue(false);
        });
        modelBuilder.Entity<City>().HasQueryFilter(e => !e.IsDeleted);

        // Court belongs to a City. Restrict deletion of a City that still has Courts.
        modelBuilder.Entity<Court>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
            entity.Property(e => e.IsDeleted).HasDefaultValue(false);

            entity
                .HasOne(e => e.City)
                .WithMany(c => c.Courts)
                .HasForeignKey(e => e.CityId)
                .OnDelete(DeleteBehavior.Restrict);
        });
        modelBuilder.Entity<Court>().HasQueryFilter(e => !e.IsDeleted);

        modelBuilder.Entity<Lawyer>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FullName).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Title).HasMaxLength(100);
            entity.Property(e => e.SyndicateCardNumber).HasMaxLength(50).IsRequired();
            entity.Property(e => e.WhatsAppNumber).HasMaxLength(20).IsRequired();
            entity.Property(e => e.IsVerified).HasDefaultValue(false);
            entity.Property(e => e.IsSuspended).HasDefaultValue(false);
            entity.Property(e => e.FcmToken).HasMaxLength(500);
            entity.Property(e => e.IdentityUserId).IsRequired();
            entity.Property(e => e.IsDeleted).HasDefaultValue(false);
        });
        modelBuilder.Entity<Lawyer>().HasQueryFilter(e => !e.IsDeleted);

        modelBuilder.Entity<HelpPost>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Description).HasMaxLength(2000).IsRequired();
            entity.Property(e => e.AttachmentUrl).HasMaxLength(1000);

            entity
                .HasOne(e => e.Court)
                .WithMany(c => c.HelpPosts)
                .HasForeignKey(e => e.CourtId)
                .OnDelete(DeleteBehavior.Restrict);

            entity
                .HasOne(e => e.City)
                .WithMany(c => c.HelpPosts)
                .HasForeignKey(e => e.CityId)
                .OnDelete(DeleteBehavior.Restrict);

            entity
                .HasOne(e => e.Lawyer)
                .WithMany(l => l.HelpPosts)
                .HasForeignKey(e => e.LawyerId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<HelpPostReply>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Comment).HasMaxLength(2000);
            entity.Property(e => e.AttachmentUrl).HasMaxLength(1000);

            entity
                .HasOne(e => e.HelpPost)
                .WithMany(p => p.Replies)
                .HasForeignKey(e => e.HelpPostId)
                .OnDelete(DeleteBehavior.Cascade);

            entity
                .HasOne(e => e.Lawyer)
                .WithMany(l => l.HelpPostReplies)
                .HasForeignKey(e => e.LawyerId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder
            .Entity<Lawyer>()
            .HasMany(l => l.ActiveCities)
            .WithMany(c => c.ActiveLawyers)
            .UsingEntity(j => j.ToTable("LawyerActiveCities"));

        modelBuilder.Entity<ProfileView>(entity =>
        {
            entity.HasKey(e => e.Id);

            // Unique constraint — one row per viewer/viewed pair (enables upsert logic).
            entity.HasIndex(e => new { e.ViewerId, e.ViewedId }).IsUnique();

            // Both FKs use Restrict to avoid SQL Server "multiple cascade paths" error.
            entity
                .HasOne(e => e.Viewer)
                .WithMany()
                .HasForeignKey(e => e.ViewerId)
                .OnDelete(DeleteBehavior.Restrict);

            entity
                .HasOne(e => e.Viewed)
                .WithMany(l => l.ProfileViewsReceived)
                .HasForeignKey(e => e.ViewedId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<UserNotification>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Body).HasMaxLength(1000).IsRequired();
            entity.Property(e => e.DataPayload).HasMaxLength(500);
            entity.Property(e => e.IsRead).HasDefaultValue(false);

            entity
                .HasOne(e => e.Lawyer)
                .WithMany(l => l.Notifications)
                .HasForeignKey(e => e.LawyerId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => new { e.LawyerId, e.CreatedAt });
        });
    }
}
