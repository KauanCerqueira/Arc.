# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and project files (excluding tests)
COPY *.sln .
COPY Arc.Api/*.csproj ./Arc.Api/
COPY Arc.Application/*.csproj ./Arc.Application/
COPY Arc.Domain/*.csproj ./Arc.Domain/
COPY Arc.Infrastructure/*.csproj ./Arc.Infrastructure/

# Restore dependencies
RUN dotnet restore Arc.Api/Arc.Api.csproj

# Copy the rest of the code (excluding tests)
COPY Arc.Api/ ./Arc.Api/
COPY Arc.Application/ ./Arc.Application/
COPY Arc.Domain/ ./Arc.Domain/
COPY Arc.Infrastructure/ ./Arc.Infrastructure/

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
