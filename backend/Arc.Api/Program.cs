using Arc.Api.Services;
using Microsoft.AspNetCore.Builder;
using NSwag;
using NSwag.Generation.Processors.Security;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

// registra os serviços
builder.Services.AddScoped<MetricsService>();
builder.Services.AddScoped<FinanceService>();
builder.Services.AddScoped<RoadmapService>();

// configura o NSwag
builder.Services.AddOpenApiDocument(config =>
{
    config.Title = "arc. API";
    config.Version = "v1";
    config.Description = "API pública do projeto arc. – workspace de produtividade e transparência.";
});

var app = builder.Build();

// ativa o Swagger e a UI SEM restrição de ambiente
app.UseOpenApi();
app.UseSwaggerUi(options =>
{
    options.DocumentTitle = "arc. API Documentation";
    options.Path = "/swagger";
    options.DocExpansion = "list";
});

// redireciona para o swagger quando a API inicia
app.MapGet("/", context =>
{
    context.Response.Redirect("/swagger");
    return Task.CompletedTask;
});

try
{
    var url = app.Urls.FirstOrDefault(u => u.StartsWith("https")) ?? "http://localhost:5000";
    System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo
    {
        FileName = url + "/swagger",
        UseShellExecute = true
    });
}
catch { /* ignora erros se ambiente sem GUI */ }


app.UseHttpsRedirection();
app.MapControllers();
app.Run();
