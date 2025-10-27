# =========================
# STAGE 1 - Build
# =========================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copia todo o conteúdo do backend
COPY . .

# Restaura dependências
RUN dotnet restore Arc.sln

# Publica a API
RUN dotnet publish Arc.API/Arc.API.csproj -c Release -o /publish

# =========================
# STAGE 2 - Runtime
# =========================
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Copia os arquivos publicados do estágio anterior
COPY --from=build /publish .

EXPOSE 8080
ENTRYPOINT ["dotnet", "Arc.API.dll"]
