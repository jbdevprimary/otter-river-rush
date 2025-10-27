#!/bin/bash
# Otter River Rush - Docker Development Helper Script
# This script simplifies common Docker operations for the project

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${PROJECT_ROOT}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
info() { echo -e "${BLUE}ℹ${NC} $1"; }
success() { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1"; exit 1; }

# Print usage
usage() {
    cat << EOF
${GREEN}Otter River Rush - Docker Helper${NC}

Usage: $0 <command> [options]

${YELLOW}Commands:${NC}
  ${GREEN}build${NC}              Build the Docker image
  ${GREEN}dev${NC}                Start interactive development shell
  ${GREEN}run <cmd>${NC}          Run a command in container (e.g., 'run npm test')
  ${GREEN}web${NC}                Start Vite dev server (localhost:5173)
  ${GREEN}preview${NC}            Preview production build (localhost:4173)
  ${GREEN}test${NC}               Run all tests
  ${GREEN}e2e${NC}                Run E2E tests
  ${GREEN}lint${NC}               Run linter
  ${GREEN}build-web${NC}          Build web production bundle
  ${GREEN}build-android${NC}      Build Android APK
  ${GREEN}generate-assets${NC}    Generate all game assets
  ${GREEN}shell${NC}              Open bash shell in running container
  ${GREEN}clean${NC}              Clean build artifacts and caches
  ${GREEN}clean-all${NC}          Clean everything including Docker volumes
  ${GREEN}logs${NC}               Show container logs
  ${GREEN}stop${NC}               Stop all containers
  ${GREEN}restart${NC}            Restart containers
  ${GREEN}verify${NC}             Verify environment setup

${YELLOW}Examples:${NC}
  $0 build              # Build Docker image
  $0 dev                # Start development environment
  $0 web                # Start dev server
  $0 run npm run lint   # Run linter
  $0 build-android      # Build APK
  $0 clean-all          # Nuclear option: clean everything

${YELLOW}Environment:${NC}
  Set ${BLUE}DOCKER_TAG${NC} to use custom image tag (default: otter-river-rush-dev)
  Set ${BLUE}NO_CACHE${NC}=1 to force rebuild without cache

EOF
}

# Check if docker and docker-compose are available
check_docker() {
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null 2>&1; then
        error "Docker Compose is not installed. Please install Docker Compose first."
    fi
}

# Get docker-compose command (handle both standalone and plugin)
get_compose_cmd() {
    if docker compose version &> /dev/null 2>&1; then
        echo "docker compose"
    else
        echo "docker-compose"
    fi
}

COMPOSE_CMD=$(get_compose_cmd)
IMAGE_TAG="${DOCKER_TAG:-otter-river-rush-dev}"

# Command implementations
cmd_build() {
    info "Building Docker image: ${IMAGE_TAG}"
    BUILD_ARGS=""
    if [ "${NO_CACHE}" = "1" ]; then
        BUILD_ARGS="--no-cache"
        warn "Building without cache (this will take longer)"
    fi
    
    docker build ${BUILD_ARGS} -t "${IMAGE_TAG}" -f .cursor/Dockerfile .
    success "Image built successfully"
}

cmd_dev() {
    info "Starting interactive development environment..."
    ${COMPOSE_CMD} -f .cursor/docker-compose.yml up -d dev
    success "Container started. Connecting..."
    ${COMPOSE_CMD} -f .cursor/docker-compose.yml exec dev bash
}

cmd_run() {
    if [ $# -eq 0 ]; then
        error "Usage: $0 run <command>"
    fi
    info "Running: $*"
    ${COMPOSE_CMD} -f .cursor/docker-compose.yml run --rm dev "$@"
}

cmd_web() {
    info "Starting Vite dev server on http://localhost:5173"
    warn "Press Ctrl+C to stop"
    ${COMPOSE_CMD} -f .cursor/docker-compose.yml run --rm -p 5173:5173 dev npm run dev
}

cmd_preview() {
    info "Starting production preview on http://localhost:4173"
    warn "Press Ctrl+C to stop"
    ${COMPOSE_CMD} -f .cursor/docker-compose.yml run --rm -p 4173:4173 dev npm run preview
}

cmd_test() {
    info "Running tests..."
    ${COMPOSE_CMD} -f .cursor/docker-compose.yml run --rm dev npm test
}

cmd_e2e() {
    info "Running E2E tests..."
    ${COMPOSE_CMD} -f .cursor/docker-compose.yml run --rm --profile test test npm run test:e2e
}

cmd_lint() {
    info "Running linter..."
    ${COMPOSE_CMD} -f .cursor/docker-compose.yml run --rm dev npm run lint
}

cmd_build_web() {
    info "Building web production bundle..."
    ${COMPOSE_CMD} -f .cursor/docker-compose.yml run --rm dev npm run build
    success "Web build complete: dist/"
}

cmd_build_android() {
    info "Building Android APK..."
    ${COMPOSE_CMD} -f .cursor/docker-compose.yml run --rm --profile android android npm run cap:build:android
    success "APK built: android/app/build/outputs/apk/release/"
}

cmd_generate_assets() {
    info "Generating game assets..."
    warn "This requires ANTHROPIC_API_KEY and/or OPENAI_API_KEY environment variables"
    ${COMPOSE_CMD} -f .cursor/docker-compose.yml run --rm \
        -e ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY}" \
        -e OPENAI_API_KEY="${OPENAI_API_KEY}" \
        dev npm run generate-all
    success "Assets generated"
}

cmd_shell() {
    info "Opening shell in running dev container..."
    if ! ${COMPOSE_CMD} -f .cursor/docker-compose.yml ps | grep -q "otter-river-rush-dev.*Up"; then
        warn "Dev container not running. Starting it first..."
        ${COMPOSE_CMD} -f .cursor/docker-compose.yml up -d dev
        sleep 2
    fi
    ${COMPOSE_CMD} -f .cursor/docker-compose.yml exec dev bash
}

cmd_clean() {
    info "Cleaning build artifacts and caches..."
    ${COMPOSE_CMD} -f .cursor/docker-compose.yml run --rm dev bash -c "
        rm -rf dist/ dist-electron/ coverage/ playwright-report/ test-results/ &&
        cd android && ./gradlew clean 2>/dev/null || true
    "
    success "Build artifacts cleaned"
}

cmd_clean_all() {
    warn "This will remove ALL Docker volumes and cached data!"
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        info "Stopping containers..."
        ${COMPOSE_CMD} -f .cursor/docker-compose.yml down -v
        
        info "Removing project Docker volumes..."
        docker volume rm otter-river-rush-dev_node_modules 2>/dev/null || true
        docker volume rm otter-river-rush-dev_android_gradle 2>/dev/null || true
        docker volume rm otter-river-rush-dev_android_build 2>/dev/null || true
        docker volume rm otter-river-rush-dev_gradle_cache 2>/dev/null || true
        docker volume rm otter-river-rush-dev_build_cache 2>/dev/null || true
        
        success "All Docker volumes removed. Next build will be fresh."
    else
        info "Cancelled"
    fi
}

cmd_logs() {
    ${COMPOSE_CMD} -f .cursor/docker-compose.yml logs -f
}

cmd_stop() {
    info "Stopping all containers..."
    ${COMPOSE_CMD} -f .cursor/docker-compose.yml down
    success "Containers stopped"
}

cmd_restart() {
    info "Restarting containers..."
    ${COMPOSE_CMD} -f .cursor/docker-compose.yml restart
    success "Containers restarted"
}

cmd_verify() {
    info "Verifying Docker environment..."
    ${COMPOSE_CMD} -f .cursor/docker-compose.yml run --rm dev bash -c "
        echo '=== Environment Verification ===' &&
        echo 'Node.js: ' && node --version &&
        echo 'npm: ' && npm --version &&
        echo 'Java: ' && java -version 2>&1 | head -n1 &&
        echo 'Gradle: ' && gradle --version | grep Gradle &&
        echo 'Android SDK: ' && ls -la \${ANDROID_SDK_ROOT}/platform-tools/adb &&
        echo 'Playwright: ' && npx playwright --version &&
        echo '' &&
        echo '=== Project Dependencies ===' &&
        npm list --depth=0 | head -n 20 &&
        echo '' &&
        echo '✅ All verifications passed!'
    "
    success "Environment verified"
}

# Main command dispatcher
main() {
    check_docker
    
    if [ $# -eq 0 ]; then
        usage
        exit 0
    fi
    
    COMMAND=$1
    shift
    
    case "${COMMAND}" in
        build)          cmd_build ;;
        dev)            cmd_dev ;;
        run)            cmd_run "$@" ;;
        web)            cmd_web ;;
        preview)        cmd_preview ;;
        test)           cmd_test ;;
        e2e)            cmd_e2e ;;
        lint)           cmd_lint ;;
        build-web)      cmd_build_web ;;
        build-android)  cmd_build_android ;;
        generate-assets) cmd_generate_assets ;;
        shell)          cmd_shell ;;
        clean)          cmd_clean ;;
        clean-all)      cmd_clean_all ;;
        logs)           cmd_logs ;;
        stop)           cmd_stop ;;
        restart)        cmd_restart ;;
        verify)         cmd_verify ;;
        help|--help|-h) usage ;;
        *)
            error "Unknown command: ${COMMAND}\n\nRun '$0 help' for usage."
            ;;
    esac
}

main "$@"
