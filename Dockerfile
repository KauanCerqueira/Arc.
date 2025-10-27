# ================================
# Etapa 1: Build
# ================================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

# Define o diretório de trabalho
WORKDIR /src

# Copia o conteúdo interno da pasta backend (sem criar backend/backend)
COPY backend/. .

# Restaura dependências e publica o projeto principal (Arc.API)
RUN dotnet restore Arc.sln
RUN dotnet publish Arc.API/Arc.API.csproj -c Release -o /app/out

# ================================
# Etapa 2: Runtime
# ================================
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime

# Define o diretório de execução
WORKDIR /app

# Copia os artefatos publicados do estágio de build
COPY --from=build /app/out .

# Expõe a porta padrão
EXPOSE 8080

# Define o ponto de entrada
ENTRYPOINT ["dotnet", "Arc.API.dll"]
