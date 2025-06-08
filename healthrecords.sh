#!/bin/bash
# filepath: setup_healthrecords.sh

set -e

# Check for required dependencies
REQUIRED_DEPS=(git dotnet npm uuidgen sed)
MISSING_DEPS=()

for dep in "${REQUIRED_DEPS[@]}"; do
    if ! command -v "$dep" >/dev/null 2>&1; then
        MISSING_DEPS+=("$dep")
    fi
done

# Check for container stack: Docker+docker-compose OR Podman+podman-compose
DOCKER_OK=false
PODMAN_OK=false

if command -v docker >/dev/null 2>&1 && command -v docker-compose >/dev/null 2>&1; then
    DOCKER_OK=true
fi
if command -v podman >/dev/null 2>&1 && command -v podman-compose >/dev/null 2>&1; then
    PODMAN_OK=true
fi

if ! $DOCKER_OK && ! $PODMAN_OK; then
    MISSING_DEPS+=("docker+docker-compose or podman+podman-compose")
fi

if [ ${#MISSING_DEPS[@]} -ne 0 ]; then
    echo "The following dependencies are missing:"
    for dep in "${MISSING_DEPS[@]}"; do
        echo "  - $dep"
    done
    echo "Please install the missing dependencies and re-run this script."
    exit 1
fi

REPO_URL="https://github.com/victorvintorez/HealthRecords.git"
PROJECT_DIR="HealthRecords"

echo "Cloning repository..."
git clone "$REPO_URL"
cd "$PROJECT_DIR"

echo "Restoring backend dependencies..."
cd HealthRecords.Server
dotnet restore
cd ..

echo "Installing frontend dependencies..."
cd HealthRecords.Web
npm ci
cd ..

if [ ! -f .env ]; then
    echo "Copying .env.example to .env..."
    cp .env.example .env
    # Automatically generate secure passwords using uuidgen
    DB_PASS=$(uuidgen)
    REDIS_PASS=$(uuidgen)
    # Replace placeholders in .env
    sed -i "s/^DB_PASSWORD=.*/DB_PASSWORD=$DB_PASS/" .env
    sed -i "s/^REDIS_PASSWORD=.*/REDIS_PASSWORD=$REDIS_PASS/" .env
    echo "Generated random DB_PASSWORD and REDIS_PASSWORD in .env."
    echo "You can review or change them in the .env file."
else
    echo ".env already exists, skipping copy."
    # If .env exists, extract passwords for later use
    DB_PASS=$(grep '^DB_PASSWORD=' .env | cut -d'=' -f2-)
    REDIS_PASS=$(grep '^REDIS_PASSWORD=' .env | cut -d'=' -f2-)
fi

if [ ! -f HealthRecords.Server/appsettings.Development.json ]; then
    echo "Copying appsettings.json to appsettings.Development.json..."
    cp HealthRecords.Server/appsettings.json HealthRecords.Server/appsettings.Development.json

    # Automatically set connection strings using generated passwords
    APPSETTINGS=HealthRecords.Server/appsettings.Development.json

    # Always use sed for placeholder replacement
    sed -i "s/{SQL_SERVER_PASSWORD}/$DB_PASS/g" "$APPSETTINGS"
    sed -i "s/{REDIS_PASSWORD}/$REDIS_PASS/g" "$APPSETTINGS"
    echo "Set DB and Redis passwords in appsettings.Development.json using sed."

    echo "Please edit HealthRecords.Server/appsettings.Development.json to set admin credentials if needed."
    read -p "Press enter to continue after editing appsettings.Development.json..."
else
    echo "appsettings.Development.json already exists, skipping copy."
fi

# Launch services with docker compose or podman compose
if command -v docker >/dev/null 2>&1 && command -v docker-compose >/dev/null 2>&1; then
    echo "Starting Docker Compose services..."
    docker compose -f compose.dev.yaml up -d
elif command -v podman >/dev/null 2>&1 && command -v podman-compose >/dev/null 2>&1; then
    echo "Starting Podman Compose services..."
    podman compose -f compose.dev.yaml up -d
fi

echo "Starting backend server..."
cd HealthRecords.Server
dotnet run --launch-profile https

echo "Setup complete. The application should be available at https://localhost:8082"