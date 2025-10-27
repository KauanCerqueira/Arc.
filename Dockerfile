# ================================
# Etapa 1: Build
# ================================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

# Diretório base dentro do container
WORKDIR /src

# Copia a pasta backend para dentro do container
COPY backend ./backend

# Entra na pasta backend
WORKDIR /src/backend

# Restaura dependências e publica o projeto principal
RUN dotnet restore Arc.sln
RUN dotnet publish Arc.API/Arc.API.csproj -c Release -o /out

# ================================
# Etapa 2: Runtime
# ================================
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime

WORKDIR /app
COPY --from=build /out .

EXPOSE 8080
ENTRYPOINT ["dotnet", "Arc.API.dll"]
