# =========================
# STAGE 1 - Build
# =========================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copia o conteúdo do backend para dentro do container
COPY . .

# Restaura dependências (usa o caminho correto do .sln)
RUN dotnet restore ./Arc.sln

# Publica o projeto principal
RUN dotnet publish ./Arc.API/Arc.API.csproj -c Release -o /app/out

# =========================
# STAGE 2 - Runtime
# =========================
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Install curl for healthcheck
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Copia os arquivos publicados do estágio anterior
COPY --from=build /app/out .

EXPOSE 8080
ENTRYPOINT ["dotnet", "Arc.API.dll"]

