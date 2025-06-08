# HealthRecords
## This is a university project, not a real application!!

---

## Notes
- This application was developed on Linux, and meant for running in a Linux environment, no guarentees are made for compatibility with Windows (especially!) or Mac!

---

## Requirements
### .NET 9 SDK
- Windows: `winget install Microsoft.DotNet.SDK.9`
- Mac: `brew install dotnet@9`
- Linux: 
    - Ubuntu: `sudo apt install dotnet-sdk-9.0 aspnet-runtime-9.0`
    - Fedora/RHEL: `sudo dnf install dotnet-sdk-9.0 aspnetcore-runtime-9.0`
    - Arch: `sudo pacman -S dotnet-sdk aspnet-runtime`

### Node.JS 22+:
- Windows: `winget install OpenJS.NodeJS`
- Mac: `brew install node`
- Linux: 
    - Ubuntu: `sudo apt install nodejs`
    - Fedora/RHEL: `sudo dnf install nodejs`
    - Arch: `sudo pacman -S nodejs`

### Docker + Docker Compose OR Podman + Podman Compose
- Windows:
    - Docker Desktop: `winget install Docker.DockerDesktop`
    - Podman Desktop: `winget install RedHat.Podman-Desktop`
- Mac:
    - Docker + Docker Compose: `brew install docker docker-compose`
    - Podman + Podman Compose: `brew install podman podman-compose`
- Linux:
    - Docker + Docker Compose:
        - Ubuntu: `sudo apt install docker docker-compose`
        - Fedora/RHEL: [Installation Instructions](https://docs.docker.com/engine/install/rhel/)
        - Arch: `sudo pacman -S docker docker-compose`
    - Podman + Podman Compose:
        - Ubuntu: `sudo apt install podman podman-compose`
        - Fedora/RHEL: `sudo dnf install podman podman-compose`
        - Arch: `sudo pacman -S podman podman-compose`

---

## How to Run Locally

### Automatic (Linux only)
```sh
curl
```
OR (requires wget)
```sh
wget
```

### Manual (Windows w/ Git Bash/Fish, Mac, Linux)
1. Clone the Repository
```sh
git clone https://github.com/victorvintorez/HealthRecords.git
```
OR (requires the GitHub CLI)
```sh
gh repo clone victorvintorez/HealthRecords
```

2. Enter the project
```sh
cd HealthRecords
```

3. Install dependencies for the API Backend
```sh
cd HealthRecords.Server
```
```sh
dotnet restore
```
```sh
cd ..
```

4. Install dependencies for the Web Frontend
```sh
cd HealthRecords.Web
```
```sh
npm ci
```
```sh
cd ..
```

5. Create Environment Variable file
Copy the example environment variable file
```sh
cp .env.example .env
```
Edit the file with secure passwords for the Database and Redis instances
A simple way to get a secure password is to generate a unique UUID
```sh
uuidgen
```

6. Configure appsettings.Development.json
Copy the existing `appsettings.json` file
```sh
cp HealthRecords.Server/appsettings.json HealthRecords.Server/appsettings.Development.json
```
Edit the appsettings.Development.json, setting the following:
- ConnectionStrings:
    - SqlConnection: Replace `{SQL_SERVER_PASSWORD}` with the database password from the `.env` file
    - CacheConnection: Replace `{REDIS_PASSWORD}` with the redis password from the `.env` file
- DefaultAdminAccount (optional):
    - Email: Set an email for the default admin account, must be valid email format. The preconfigured default email is: admin@admin.net
    - Password: Set a password for the default admin account, must contain: 6+ characters total, 1+ uppercase, 1+ lowercase, 1+ special, 1+ number. The preconfigured default password is: Admin123!

7. Start Docker/Podman Compose Services
```sh
docker compose -f compose.dev.yaml up -d
```
OR
```sh
podman compose -f compose.dev.yaml up -d
```

8. Start the application
```sh
cd HealthRecords.Server
```
```sh
dotnet run --launch-profile https
```

The application will now be available at https://localhost:8082
