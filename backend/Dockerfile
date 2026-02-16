# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and project files
COPY *.sln .
COPY Arc.Api/*.csproj ./Arc.Api/
COPY Arc.Application/*.csproj ./Arc.Application/
COPY Arc.Domain/*.csproj ./Arc.Domain/
COPY Arc.Infrastructure/*.csproj ./Arc.Infrastructure/
COPY Arc.Tests/*.csproj ./Arc.Tests/

# Restore dependencies
RUN dotnet restore

# Copy the rest of the code
COPY . .

# Build and Publish
WORKDIR /src/Arc.Api
RUN dotnet publish -c Release -o /app/publish

# Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

# Expose port
EXPOSE 8080

# Entry point
ENTRYPOINT ["dotnet", "Arc.Api.dll"]
