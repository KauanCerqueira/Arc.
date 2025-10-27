# Etapa 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copia apenas a pasta backend (onde está a solução)
COPY backend/ ./backend/

# Entra na pasta backend
WORKDIR /src/backend

# Restaura pacotes e publica
RUN dotnet restore Arc.sln
RUN dotnet publish Arc.API/Arc.API.csproj -c Release -o /app/out

# Etapa 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/out .
ENV ASPNETCORE_URLS=http://+:10000
EXPOSE 10000
ENTRYPOINT ["dotnet", "Arc.API.dll"]
