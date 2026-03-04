using System.Security.Claims;
using System.Text;
using EgyptianLawyers.Api.Behaviors;
using EgyptianLawyers.Api.Common;
using EgyptianLawyers.Api.Configurations;
using EgyptianLawyers.Api.Data;
using EgyptianLawyers.Api.Domain.Entities;
using EgyptianLawyers.Api.Errors;
using EgyptianLawyers.Api.Extensions;
using EgyptianLawyers.Api.Services;
using FirebaseAdmin;
using FluentValidation;
using Google.Apis.Auth.OAuth2;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

var firebaseKeyPath = Path.Combine(builder.Environment.ContentRootPath, "firebase-admin-key.json");
if (File.Exists(firebaseKeyPath))
{
    FirebaseApp.Create(new AppOptions { Credential = GoogleCredential.FromFile(firebaseKeyPath) });
}
else
{
    // A warning so you know if the file goes missing on SmarterASP later
    Console.WriteLine("WARNING: firebase-admin-key.json not found. Push notifications will fail.");
}

// DbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
);

// Identity
builder
    .Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
    {
        options.Password.RequireDigit = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireUppercase = true;
        options.Password.RequireNonAlphanumeric = false;
        options.Password.RequiredLength = 8;
    })
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

// Authentication / JWT
var jwtSection = builder.Configuration.GetSection("Jwt");
var key = Encoding.UTF8.GetBytes(jwtSection["Key"]!);

builder
    .Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSection["Issuer"],
            ValidAudience = jwtSection["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(key),
        };
    });

builder.Services.AddAuthorization(options =>
{
    // Verified: account has been approved by admin.
    // Suspended lawyers still pass (they can read the app, but not write).
    options.AddPolicy(
        PolicyNames.RequireVerified,
        policy =>
            policy.RequireAssertion(ctx =>
                ctx.User.IsInRole("Admin") || ctx.User.FindFirstValue("IsVerified") == "True"
            )
    );

    // Active: verified AND not suspended — required for all write operations.
    options.AddPolicy(
        PolicyNames.RequireActive,
        policy =>
            policy.RequireAssertion(ctx =>
                ctx.User.IsInRole("Admin")
                || (
                    ctx.User.FindFirstValue("IsVerified") == "True"
                    && ctx.User.FindFirstValue("IsSuspended") == "False"
                )
            )
    );
});

builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "AllowAll",
        policy =>
        {
            policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
        }
    );
});

// MediatR / FluentValidation / pipeline
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(Program).Assembly));
builder.Services.AddValidatorsFromAssembly(typeof(Program).Assembly);
builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));

// Notification service
builder.Services.AddScoped<INotificationService, FcmNotificationService>();

// Cloudinary configuration
builder.Services.Configure<CloudinaryOptions>(cfg =>
    builder.Configuration.GetSection(CloudinaryOptions.SectionName)
);

builder.Services.AddSingleton<ICloudinaryService, CloudinaryService>();

// Exceptions, Swagger
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Egyptian Lawyers Network API", Version = "v1" });

    var securityScheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Description = "Enter your JWT token: **Bearer {token}**",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" },
    };

    c.AddSecurityDefinition("Bearer", securityScheme);
    c.AddSecurityRequirement(
        new OpenApiSecurityRequirement { { securityScheme, Array.Empty<string>() } }
    );
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<ApplicationDbContext>();
    await context.Database.MigrateAsync();

    var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
    var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();

    // 1. Seed Roles
    foreach (var roleName in new[] { "Lawyer", "Admin" })
    {
        if (!await roleManager.RoleExistsAsync(roleName))
            await roleManager.CreateAsync(new IdentityRole(roleName));
    }

    var adminEmail = "admin@gmail.com";
    var adminUser = await userManager.FindByEmailAsync(adminEmail);

    if (adminUser == null)
    {
        adminUser = new ApplicationUser
        {
            UserName = adminEmail,
            Email = adminEmail,
            EmailConfirmed = true,
        };

        var result = await userManager.CreateAsync(adminUser, "Admin@123");
        if (result.Succeeded)
        {
            await userManager.AddToRoleAsync(adminUser, "Admin");
        }
    }
}

// Pipeline
app.UseExceptionHandler();
app.UseSwagger();
app.UseSwaggerUI(c =>
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Egyptian Lawyers Network API v1")
);
app.UseHttpsRedirection();
app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();
app.MapEndpoints();

app.MapGet("/", () => Results.Ok("Egyptian Lawyers Network API is running"));
app.MapGet("/health", () => Results.Ok("Healthy"));

await app.RunAsync();
