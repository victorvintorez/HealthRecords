# HealthRecords
## This is a university project, not a real application!!

---

## Notes
- This application was developed on Linux, and meant for running in a Linux environment, no guarentees are made for compatibility with Windows (especially!) or Mac!

---

## Requirements
### .NET 9 SDK
- Windows: 
- Mac: 
- Linux: 
    - Debian/Ubuntu: 
    - Fedora/RHEL:
    - Arch: 

### Node.JS 22+:
- Windows:
- Mac: 
- Linux: 
    - Debian/Ubuntu: 
    - Fedora/RHEL:
    - Arch: 

### Docker + Docker Compose OR Podman + Podman Compose
- Windows:
    - Docker Desktop: 
    - Podman Desktop: 
- Mac:
    - Docker:
    - Podman:
- Linux:
    - Docker:
        - Debian/Ubuntu: 
        - Fedora/RHEL:
        - Arch: 
    - Podman:
        - Debian/Ubuntu: 
        - Fedora/RHEL:
        - Arch: 

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

### Manual (Windows, Mac, Linux)
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

4. Install dependencies for the Web Frontend
```sh
cd HealthRecords.Web
```
```sh
npm ci
```

5. Create Environment Variable file
