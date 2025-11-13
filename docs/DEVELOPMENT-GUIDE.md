# 👨‍💻 Development Guide - Arc. Platform

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 20.0.0
- **.NET SDK** >= 8.0
- **PostgreSQL** >= 14
- **Git**
- **Docker** (optional)

### Clone & Setup

```bash
# Clone repository
git clone https://github.com/YourUsername/Arc.git
cd Arc

# Install backend dependencies
cd backend
dotnet restore

# Install frontend dependencies
cd ../frontend
npm install
```

---

## 🔧 Backend Development

### Database Setup

1. **Configure Connection String**

Edit `backend/Arc.API/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=arc;Username=postgres;Password=yourpassword"
  }
}
```

2. **Run Migrations**

```bash
cd backend/Arc.API
dotnet ef database update
```

3. **Seed Data** (optional)

```bash
dotnet run --seed
```

### Run Backend

```bash
cd backend/Arc.API
dotnet run
# or with hot reload
dotnet watch run
```

**Available at:**
- API: `http://localhost:5000`
- Swagger: `http://localhost:5000`

### Project Structure

```
backend/
├── Arc.API/
│   ├── Controllers/
│   │   ├── Auth/          # Add new auth endpoints here
│   │   ├── Workspace/     # Workspace management
│   │   └── Templates/     # Template-specific endpoints
│   ├── Middlewares/
│   └── Program.cs         # DI configuration
│
├── Arc.Application/
│   ├── DTOs/             # Add new DTOs here
│   ├── Services/         # Business logic
│   ├── Interfaces/
│   └── Encryption/       # Encryption interfaces
│
├── Arc.Domain/
│   └── Entities/         # Add new entities here
│
└── Arc.Infrastructure/
    ├── Data/             # DbContext
    ├── Repositories/     # Data access
    └── Security/         # Encryption implementation
```

### Adding a New Endpoint

1. **Create DTO** (`Arc.Application/DTOs/`)

```csharp
public class CreateWidgetDto
{
    [Required]
    public string Name { get; set; }
    public string? Description { get; set; }
}
```

2. **Create Entity** (`Arc.Domain/Entities/`)

```csharp
public class Widget
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

3. **Add to DbContext** (`Arc.Infrastructure/Data/AppDbContext.cs`)

```csharp
public DbSet<Widget> Widgets { get; set; }
```

4. **Create Migration**

```bash
cd backend/Arc.API
dotnet ef migrations add AddWidgets
dotnet ef database update
```

5. **Create Repository Interface** (`Arc.Domain/Interfaces/`)

```csharp
public interface IWidgetRepository
{
    Task<List<Widget>> GetAllAsync();
    Task<Widget?> GetByIdAsync(Guid id);
    Task<Widget> CreateAsync(Widget widget);
    Task UpdateAsync(Widget widget);
    Task DeleteAsync(Guid id);
}
```

6. **Implement Repository** (`Arc.Infrastructure/Repositories/`)

```csharp
public class WidgetRepository : IWidgetRepository
{
    private readonly AppDbContext _context;

    public WidgetRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Widget>> GetAllAsync()
    {
        return await _context.Widgets.ToListAsync();
    }
    // ... implement other methods
}
```

7. **Create Service** (`Arc.Application/Services/`)

```csharp
public class WidgetService : IWidgetService
{
    private readonly IWidgetRepository _repository;

    public WidgetService(IWidgetRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<Widget>> GetAllAsync()
    {
        return await _repository.GetAllAsync();
    }
    // ... implement business logic
}
```

8. **Register Services** (`Arc.API/Program.cs`)

```csharp
builder.Services.AddScoped<IWidgetRepository, WidgetRepository>();
builder.Services.AddScoped<IWidgetService, WidgetService>();
```

9. **Create Controller** (`Arc.API/Controllers/Widgets/`)

```csharp
namespace Arc.API.Controllers.Widgets;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WidgetsController : ControllerBase
{
    private readonly IWidgetService _widgetService;

    public WidgetsController(IWidgetService widgetService)
    {
        _widgetService = widgetService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var widgets = await _widgetService.GetAllAsync();
        return Ok(widgets);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateWidgetDto dto)
    {
        var widget = await _widgetService.CreateAsync(dto);
        return Ok(widget);
    }
}
```

### Using Encryption

```csharp
public class SecureDataService
{
    private readonly IEncryptionService _encryption;
    private readonly IAuditLogService _auditLog;

    public async Task SaveSensitiveData(string data, Guid userId)
    {
        // Encrypt data
        var encrypted = _encryption.Encrypt(data);

        // Save encrypted data
        await _repository.SaveAsync(encrypted);

        // Log the action
        await _auditLog.LogAsync(
            userId: userId,
            action: "SaveSensitiveData",
            details: new { dataType = "sensitive" },
            result: "Success",
            category: "DataAccess"
        );
    }

    public async Task<string> GetSensitiveData(string encryptedData)
    {
        // Decrypt data
        return _encryption.Decrypt(encryptedData);
    }
}
```

---

## 💻 Frontend Development

### Run Frontend

```bash
cd frontend

# Development (with hot reload)
npm run dev

# Development with specific config
npm run dev:local    # Local API
npm run dev:tunnel   # Tunnel/ngrok API

# Production build
npm run build
npm run start
```

**Available at:**
- Frontend: `http://localhost:3000`

### Project Structure

```
frontend/src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes
│   ├── (workspace)/       # Protected workspace routes
│   └── layout.tsx         # Root layout
│
├── core/
│   ├── services/          # API services
│   ├── hooks/             # React hooks
│   ├── providers/         # Context providers
│   ├── store/             # Zustand stores
│   ├── templates/         # JSON template system
│   └── utils/
│       ├── dynamic-imports.ts  # Lazy loading
│       └── motion.ts           # Framer Motion utils
│
├── components/            # Shared components
└── features/             # Feature modules
```

### Adding a New Page

1. **Create Route** (`app/(workspace)/my-feature/page.tsx`)

```tsx
'use client';

export default function MyFeaturePage() {
  return (
    <div className="container p-6">
      <h1 className="text-3xl font-bold">My Feature</h1>
      {/* Your content */}
    </div>
  );
}
```

2. **Create Loading State** (`app/(workspace)/my-feature/loading.tsx`)

```tsx
export default function Loading() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}
```

3. **Create Error Boundary** (`app/(workspace)/my-feature/error.tsx`)

```tsx
'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-red-600">Something went wrong!</h2>
      <button onClick={reset} className="mt-4 rounded bg-primary px-4 py-2 text-white">
        Try again
      </button>
    </div>
  );
}
```

### Using TanStack Query

```tsx
'use client';

import { useApiQuery, useApiMutation } from '@/core/hooks/use-api';

export default function WidgetsPage() {
  // Fetch data
  const { data: widgets, isLoading } = useApiQuery<Widget[]>({
    key: ['widgets'],
    url: '/api/widgets'
  });

  // Mutation
  const createWidget = useApiMutation<Widget, CreateWidgetDto>({
    method: 'POST',
    url: '/api/widgets',
    invalidateKeys: [['widgets']] // Refetch widgets after creation
  });

  const handleCreate = () => {
    createWidget.mutate({ name: 'New Widget' });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <button onClick={handleCreate}>Create Widget</button>
      {widgets?.map(widget => (
        <div key={widget.id}>{widget.name}</div>
      ))}
    </div>
  );
}
```

### Dynamic Imports

```tsx
import { DynamicTipTapEditor, DynamicKanbanBoard } from '@/core/utils/dynamic-imports';

// Heavy component loaded only when needed
export default function EditorPage() {
  return (
    <div>
      <h1>Editor</h1>
      <DynamicTipTapEditor />
    </div>
  );
}
```

### Optimized Animations

```tsx
import { Motion, animations, springs } from '@/core/utils/motion';

export default function AnimatedCard() {
  return (
    <Motion.div
      {...animations.fadeIn}
      transition={springs.smooth}
    >
      Card content
    </Motion.div>
  );
}
```

### Creating a JSON Template

1. **Create Template File** (`public/templates/my-template.json`)

```json
{
  "meta": {
    "id": "my-template",
    "name": "My Template",
    "version": "1.0.0",
    "category": "Custom"
  },
  "layout": {
    "main": {
      "type": "Container",
      "children": [
        {
          "type": "Header",
          "props": {
            "value": { "type": "constant", "source": "My Template" }
          }
        },
        {
          "type": "Grid",
          "loop": { "type": "state", "source": "items" },
          "children": [
            {
              "type": "Card",
              "children": [
                {
                  "type": "Text",
                  "props": {
                    "value": { "type": "computed", "source": "item.name" }
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  },
  "state": [
    { "key": "items", "initialValue": [] }
  ]
}
```

2. **Render Template**

```tsx
import { useTemplate, TemplateRenderer } from '@/core/templates/template-renderer';

export default function MyTemplatePage() {
  const { template, loading } = useTemplate('my-template');

  if (loading) return <div>Loading template...</div>;
  if (!template) return <div>Template not found</div>;

  return (
    <TemplateRenderer
      template={template}
      data={{ items: [...] }}
      onEvent={(event, data) => {
        console.log('Event:', event, data);
      }}
    />
  );
}
```

---

## 🧪 Testing

### Backend Tests

```bash
cd backend/Tests
dotnet test

# With coverage
dotnet test /p:CollectCoverage=true
```

### Frontend Tests

```bash
cd frontend

# Unit tests
npm run test

# E2E tests
npm run test:e2e
```

---

## 🐛 Debugging

### Backend (VS Code)

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": ".NET Core Launch (web)",
      "type": "coreclr",
      "request": "launch",
      "preLaunchTask": "build",
      "program": "${workspaceFolder}/backend/Arc.API/bin/Debug/net8.0/Arc.API.dll",
      "args": [],
      "cwd": "${workspaceFolder}/backend/Arc.API",
      "stopAtEntry": false,
      "serverReadyAction": {
        "action": "openExternally",
        "pattern": "\\bNow listening on:\\s+(https?://\\S+)"
      },
      "env": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    }
  ]
}
```

### Frontend (Chrome DevTools)

- Open Chrome DevTools
- Sources tab → Add workspace folder
- Set breakpoints in TypeScript files
- Debug with `console.log` or React DevTools

---

## 📦 Building for Production

### Backend

```bash
cd backend
dotnet publish -c Release -o ./publish
```

### Frontend

```bash
cd frontend
npm run build

# Analyze bundle
ANALYZE=true npm run build
```

### Docker

```bash
# Build images
docker-compose build

# Run services
docker-compose up -d
```

---

## 🔗 Useful Commands

### Backend

```bash
# Create migration
dotnet ef migrations add MigrationName

# Update database
dotnet ef database update

# Rollback migration
dotnet ef database update PreviousMigrationName

# Remove last migration
dotnet ef migrations remove

# Generate migration SQL
dotnet ef migrations script
```

### Frontend

```bash
# Clean build
rm -rf .next && npm run build

# Check types
npx tsc --noEmit

# Lint
npm run lint

# Format
npx prettier --write "src/**/*.{ts,tsx}"
```

---

## 📚 Resources

- [ASP.NET Core Docs](https://docs.microsoft.com/aspnet/core)
- [Next.js Docs](https://nextjs.org/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

---

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Write tests
4. Update documentation
5. Submit a pull request

---

**Happy Coding! 🚀**
