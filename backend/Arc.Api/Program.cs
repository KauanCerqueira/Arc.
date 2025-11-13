using System.Text;
using Arc.API.Middleware;
using Arc.Application.Interfaces;
using Arc.Application.Services;
using Arc.Domain.Interfaces;
using Arc.Infrastructure.Data;
using Arc.Infrastructure.Repositories;
using Arc.Infrastructure.Security;
using Arc.Infrastructure.Services;
using AspNetCoreRateLimit;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;

var builder = WebApplication.CreateBuilder(args);

// ===== BANCO DE DADOS =====
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' não encontrada");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// ===== INJEÇÃO DE DEPENDÊNCIA =====
// Repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IWorkspaceRepository, WorkspaceRepository>();
builder.Services.AddScoped<IGroupRepository, GroupRepository>();
builder.Services.AddScoped<IPageRepository, PageRepository>();
builder.Services.AddScoped<IPromoCodeRepository, PromoCodeRepository>();
builder.Services.AddScoped<IWorkspaceMemberRepository, WorkspaceMemberRepository>();
builder.Services.AddScoped<IWorkspaceInvitationRepository, WorkspaceInvitationRepository>();
builder.Services.AddScoped<IGroupPermissionRepository, GroupPermissionRepository>();
builder.Services.AddScoped<IPagePermissionRepository, PagePermissionRepository>();
builder.Services.AddScoped<ISprintRepository, SprintRepository>();
builder.Services.AddScoped<ISprintTaskRepository, SprintTaskRepository>();
builder.Services.AddScoped<IBudgetRepository, BudgetRepository>();

// Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IWorkspaceService, WorkspaceService>();
builder.Services.AddScoped<IGroupService, GroupService>();
builder.Services.AddScoped<IPageService, PageService>();
builder.Services.AddScoped<IAnalyticsService, AnalyticsService>();
builder.Services.AddScoped<ITeamService, TeamService>();
builder.Services.AddScoped<ISubscriptionService, SubscriptionService>();

// Integration Services (Secure with OAuth + Encryption)
builder.Services.AddScoped<IIntegrationTokenService, Arc.Infrastructure.Services.IntegrationTokenService>();
builder.Services.AddScoped<IIntegrationSyncService, Arc.Infrastructure.Services.IntegrationSyncService>();
builder.Services.AddScoped<IExternalIntegrationService, Arc.Infrastructure.Services.Integrations.GoogleIntegrationService>();
builder.Services.AddScoped<Arc.Infrastructure.Services.Integrations.GitHubIntegrationService>();

// Legacy Integration Services (deprecated - use IExternalIntegrationService instead)
builder.Services.AddScoped<IGoogleIntegrationService, Arc.Application.Services.GoogleIntegrationService>();
builder.Services.AddScoped<IGitHubIntegrationService, Arc.Application.Services.GitHubIntegrationService>();

// Encryption Services
builder.Services.AddSingleton<Arc.Application.Encryption.IKeyManagementService, Arc.Infrastructure.Security.Encryption.KeyManagementService>();
builder.Services.AddScoped<Arc.Application.Encryption.IEncryptionService, Arc.Infrastructure.Security.Encryption.EncryptionService>();
builder.Services.AddScoped<Arc.Application.Encryption.IHmacService, Arc.Infrastructure.Security.Encryption.HmacService>();

// Audit Log Service
builder.Services.AddScoped<IAuditLogService, AuditLogService>();

// Rate Limiting for Integrations
builder.Services.AddMemoryCache();
builder.Services.AddScoped<Arc.Infrastructure.RateLimiting.IIntegrationRateLimiter, Arc.Infrastructure.RateLimiting.IntegrationRateLimiter>();

// HttpClientFactory para chamadas externas (OAuth, APIs)
builder.Services.AddHttpClient();

// Template Services
builder.Services.AddScoped<IFlowchartService, FlowchartService>();
builder.Services.AddScoped<IRoadmapService, RoadmapService>();
builder.Services.AddScoped<IDocumentsService, DocumentsService>();
builder.Services.AddScoped<IKanbanService, KanbanService>();
builder.Services.AddScoped<ICalendarService, CalendarService>();
builder.Services.AddScoped<IMindMapService, MindMapService>();
builder.Services.AddScoped<ISprintService, SprintService>();
builder.Services.AddScoped<IWikiService, WikiService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<ITasksService, TasksService>();
builder.Services.AddScoped<ITableService, TableService>();
builder.Services.AddScoped<IProjectsService, ProjectsService>();
builder.Services.AddScoped<IBugsService, BugsService>();
builder.Services.AddScoped<IStudyService, StudyService>();
builder.Services.AddScoped<IBudgetService, BudgetService>();
builder.Services.AddScoped<IBudgetPdfService, BudgetPdfService>();
builder.Services.AddScoped<IFocusService, FocusService>();
builder.Services.AddScoped<INotesService, NotesService>();
builder.Services.AddScoped<ITimelineService, TimelineService>();
builder.Services.AddScoped<IWorkoutService, WorkoutService>();
builder.Services.AddScoped<INutritionService, NutritionService>();
builder.Services.AddScoped<IPersonalBudgetService, PersonalBudgetService>();
builder.Services.AddScoped<IBusinessBudgetService, BusinessBudgetService>();

// ===== AUTENTICAÇÃO JWT =====
var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("JWT Key não configurada");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// ===== CONTROLLERS =====
builder.Services.AddControllers();

// ===== SWAGGER =====
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Arc. API",
        Version = "v1",
        Description = "API do sistema Arc. - Sistema de autenticação e gerenciamento",
        Contact = new OpenApiContact
        {
            Name = "Arc. Team",
            Email = "contato@arc.com"
        }
    });

    // Resolve conflitos de nomes duplicados usando namespace completo
    options.CustomSchemaIds(type => type.FullName);

    // Configuração para JWT no Swagger
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Insira o token JWT no formato: Bearer {seu token}"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });

    // Habilita comentários XML
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        options.IncludeXmlComments(xmlPath);
    }
});

// ===== RATE LIMITING =====
builder.Services.AddMemoryCache();
builder.Services.Configure<IpRateLimitOptions>(options =>
{
    options.EnableEndpointRateLimiting = true;
    options.StackBlockedRequests = false;
    options.HttpStatusCode = 429;
    options.RealIpHeader = "X-Real-IP";
    options.GeneralRules = new List<RateLimitRule>
    {
        new RateLimitRule
        {
            Endpoint = "POST:/api/auth/login",
            Period = "1m",
            Limit = 5
        },
        new RateLimitRule
        {
            Endpoint = "POST:/api/auth/register",
            Period = "1m",
            Limit = 3
        },
        new RateLimitRule
        {
            Endpoint = "*",
            Period = "1m",
            Limit = 100
        }
    };
});

builder.Services.AddInMemoryRateLimiting();
builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();

// ===== CORS =====
// ===== CORS =====
builder.Services.AddCors(options =>
{
    options.AddPolicy("DynamicCorsPolicy", policy =>
    {
        policy
            .SetIsOriginAllowed(_ => true) // ✅ Permite qualquer origem dinamicamente
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials(); // se estiver usando cookies/token no header
    });
});


// ===== HEALTH CHECKS =====
builder.Services.AddHealthChecks()
    .AddNpgSql(builder.Configuration.GetConnectionString("DefaultConnection") ?? "",
        name: "database",
        timeout: TimeSpan.FromSeconds(3),
        tags: new[] { "ready" });

var app = builder.Build();

// ===== PIPELINE =====
// Middleware de exception handling (deve ser o primeiro)
app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "Arc. API v1");
    options.RoutePrefix = string.Empty; // Swagger na raiz
});

// CORS deve vir ANTES de HttpsRedirection
app.UseCors("DynamicCorsPolicy");

// Desabilitar HttpsRedirection em desenvolvimento para evitar problemas com CORS
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// Rate Limiting
app.UseIpRateLimiting();

app.UseAuthentication();
app.UseAuthorization();

// Health Checks
app.MapHealthChecks("/health");
app.MapHealthChecks("/health/ready", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready")
});

app.MapControllers();

app.Run();
