# =========================
# STAGE 1 - Build
# =========================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia todo o conteúdo da pasta backend (onde está o Arc.sln)
COPY . .

# Restaura dependências do projeto
RUN dotnet restore Arc.sln

# Publica o projeto da API
RUN dotnet publish Arc.API/Arc.API.csproj -c Release -o /publish

# =========================
# STAGE 2 - Runtime
# =========================
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime

WORKDIR /app

# Copia o resultado do build
COPY --from=build /publish .

EXPOSE 8080

ENTRYPOINT ["dotnet", "Arc.API.dll"]
