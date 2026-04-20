#!/bin/bash

##############################################################################
# Gymtality FRONTEND Deployment Script
# Deploys Next.js frontend to VPS with PM2
#
# Usage:
#   ./deploy.sh                    # Deploy to production
#   ./deploy.sh --build-only       # Just build locally
#   ./deploy.sh --status           # Check VPS status
#   ./deploy.sh --logs             # Tail logs from VPS
##############################################################################

set -e

# Configuration
VPS_HOST="167.234.214.60"
VPS_USER="ubuntu"
VPS_KEY_PATH="$HOME/gymtality.key"
VPS_APP_PATH="/home/ubuntu/gymtality"
PM2_APP_NAME="gymtality"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
  log_info "Checking prerequisites..."

  if [ ! -f "$VPS_KEY_PATH" ]; then
    log_error "SSH key not found at: $VPS_KEY_PATH"
    echo "Please ensure SSH key is at: $VPS_KEY_PATH"
    exit 1
  fi

  if ! command -v ssh &> /dev/null; then
    log_error "SSH not found. Please install SSH client."
    exit 1
  fi

  chmod 600 "$VPS_KEY_PATH"
  log_info "Prerequisites check passed ✓"
}

# Build locally
build_local() {
  log_info "Building frontend locally..."

  npm install
  npm run build

  if [ ! -d ".next" ]; then
    log_error "Build failed - .next directory not found"
    exit 1
  fi

  log_info "Build successful ✓"
}

# Deploy to VPS
deploy_to_vps() {
  log_info "Deploying to VPS ($VPS_HOST)..."

  # Test SSH connection
  log_info "Testing SSH connection..."
  ssh -i "$VPS_KEY_PATH" \
    -o StrictHostKeyChecking=no \
    -o ConnectTimeout=5 \
    "$VPS_USER@$VPS_HOST" "echo 'SSH connection OK'" || {
    log_error "Cannot connect to VPS via SSH"
    exit 1
  }

  # Deploy via SSH
  log_info "Running deployment commands on VPS..."
  ssh -i "$VPS_KEY_PATH" \
    -o StrictHostKeyChecking=no \
    "$VPS_USER@$VPS_HOST" << 'EOF'
set -e
cd /home/ubuntu/gymtality

# Pull latest code
echo "[1/6] Pulling latest code..."
git pull

# Install dependencies
echo "[2/6] Installing dependencies..."
npm install

# Build
echo "[3/6] Building frontend..."
npm run build

# Restart PM2
echo "[4/6] Restarting PM2 process..."
pm2 restart gymtality

# Health check
echo "[5/6] Running health check..."
sleep 2
curl -s https://gymtality.fit/ | head -c 100 || echo "Health check pending..."

echo "✓ Deployment complete!"
EOF

  log_info "Deployment to VPS complete ✓"
}

# Check status
check_status() {
  log_info "Checking VPS status..."

  ssh -i "$VPS_KEY_PATH" \
    -o StrictHostKeyChecking=no \
    "$VPS_USER@$VPS_HOST" << 'EOF'
echo "=== PM2 Status ==="
pm2 list

echo ""
echo "=== Recent Logs ==="
pm2 logs gymtality --lines 10 --nostream

echo ""
echo "=== Health Check ==="
curl -s https://gymtality.fit/api/health || echo "Health check unavailable"
EOF
}

# Tail logs
tail_logs() {
  log_info "Tailing logs from VPS (Ctrl+C to exit)..."

  ssh -i "$VPS_KEY_PATH" \
    -o StrictHostKeyChecking=no \
    "$VPS_USER@$VPS_HOST" << 'EOF'
pm2 logs gymtality
EOF
}

# Main
main() {
  case "${1:-}" in
    --build-only)
      build_local
      log_info "Build complete. To deploy to VPS, run: ./deploy.sh"
      ;;
    --status)
      check_prerequisites
      check_status
      ;;
    --logs)
      check_prerequisites
      tail_logs
      ;;
    *)
      check_prerequisites
      build_local
      deploy_to_vps
      check_status
      log_info "✅ Deployment complete!"
      ;;
  esac
}

main "$@"
