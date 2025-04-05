FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["HealthRecords.Server/HealthRecords.Server.csproj", "HealthRecords.Server/", "HealthRecords.Web/HeathRecords.Web.esproj", "HealthRecords.Web/"]
RUN dotnet restore "HealthRecords.Server/HealthRecords.Server.csproj"
COPY . .
WORKDIR "/src/HealthRecords.Server"
RUN dotnet build "./HealthRecords.Server.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./HealthRecords.Server.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "HealthRecords.Server.dll"]
