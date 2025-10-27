# Etapa 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copia o conteúdo do backend, mas mantém a estrutura de pastas original
COPY backend ./ 

RUN dotnet restore backend/Arc.sln
RUN dotnet publish backend/Arc.API/Arc.API.csproj -c Release -o /app/out

# Etapa 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/out .

EXPOSE 8080
ENTRYPOINT ["dotnet", "Arc.API.dll"]
