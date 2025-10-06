using System.Reflection;
using System.Text;
using System.Text.Json.Serialization;
using log4net;
using log4net.Config;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;


var builder = WebApplication.CreateBuilder(args);


var repo = LogManager.GetRepository(Assembly.GetEntryAssembly());
var log4netPath = Path.Combine(AppContext.BaseDirectory, "log4net.config");
XmlConfigurator.Configure(repo, new FileInfo(log4netPath));


// Log de arranque
var bootLog = LogManager.GetLogger(typeof(Program));
bootLog.Info("API starting…");


builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "SMSBackboneAPI",
        Version = "v1",
        Description = "Documentación de la API SMS"
    });

    var xmlFilename = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFilename);
    if (File.Exists(xmlPath))
        c.IncludeXmlComments(xmlPath);
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

// Hosted services
builder.Services.AddHostedService<ReportCleanupService>();

// --- Auth (JWT) ---
var secret = builder.Configuration["SecretKey"];
if (string.IsNullOrWhiteSpace(secret))
{
    bootLog.Warn("SecretKey is missing from configuration.");
}
var key = Encoding.UTF8.GetBytes(secret ?? "");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidIssuer = builder.Configuration["JwtIssuer"],
        ValidAudience = builder.Configuration["JwtAudience"],
        ClockSkew = TimeSpan.Zero
    };
});


builder.Services.AddCors();


var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "SMSBackboneAPI v1");
});

// HTTPS, estáticos, CORS
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseCors(x => x
    .AllowAnyMethod()
    .AllowAnyHeader()
    .SetIsOriginAllowed(_ => true)
    .AllowCredentials());      

// AuthZ
app.UseAuthentication();
app.UseAuthorization();

// Rutas
app.MapControllers();

// Log de arranque OK
bootLog.Info("API started and ready to accept requests.");

app.Run();
