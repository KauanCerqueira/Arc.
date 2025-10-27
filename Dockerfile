# ================================
# Etapa 1: Build
# ================================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

# Define o diretório de trabalho principal
WORKDIR /src

# Copia a pasta backend inteira para dentro do container
COPY backend ./backend

# Entra na pasta onde está o .sln
WORKDIR /src/backend

# Restaura dependências e publica o projeto principal
RUN dotnet restore Arc.sln
RUN dotnet publish Arc.API/Arc.API.csproj -c Release -o /out

# ================================
# Etapa 2: Runtime
# ================================
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime

# Define o diretório de execução
WORKDIR /app

# Copia o resultado do build
COPY --from=build /out .

# Expõe a porta 8080 (usada pelo Railway)
EXPOSE 8080

# Define o ponto de entrada
ENTRYPOINT ["dotnet", "Arc.API.dll"]
