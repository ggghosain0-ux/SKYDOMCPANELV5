#!/usr/bin/env bash

# ==============================================================================
#   ____  _  ____     ____   ___    ____   _    _   _ _____ _     
#  / ___|| |/ /\ \   / /  _ \ / _ \  |  _ \ / \  | \ | | ____| |    
#  \___ \| ' /  \ \ / /| | | | | | | | |_) / _ \ |  \| |  _| | |    
#   ___) | . \   \ V / | |_| | |_| | |  __/ ___ \| |\  | |___| |___ 
#  |____/|_|\_\   \_/  |____/ \___/  |_| /_/   \_\_| \_|_____|_____|
#                                                                   
#  SKYDO CLOUD VPS HOSTING PANEL - AUTOMATIC INSTALLER (V5)
#  Premium Offline-Capable Virtual Server Management Platform
#  Credits: SKYDO YouTube & Development Services
# ==============================================================================

# SCRIPT CONFIGURATION
REPO_URL="https://github.com/ggghosain0-ux/SKYDOMCPANELV5"
TARGET_DIR="SKYDOPANELV5"
APP_NAME="skydocloud-panel"
DEFAULT_PORT=3000

# ANSI COLORS
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Ensure script is run as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}[ERROR] This installer must be executed as root (sudo).${NC}"
  echo -e "Please run: ${CYAN}sudo bash $0${NC}"
  exit 1
fi

# Multi-OS detection
OS=""
if [ -f /etc/os-release ]; then
  . /etc/os-release
  OS=$ID
else
  echo -e "${RED}[ERROR] Unsupported distribution. Could not read /etc/os-release.${NC}"
  exit 1
fi

# Print header and branding
clear
echo -e "${CYAN}======================================================================${NC}"
echo -e "${WHITE}  ____  _  ____     ____   ___    ____   _    _   _ _____ _     ${NC}"
echo -e "${WHITE} / ___|| |/ /\\ \\   / /  _ \\ / _ \\  |  _ \\ / \\  | \\ | | ____| |    ${NC}"
echo -e "${WHITE} \\___ \\| ' /  \\ \\ / /| | | | | | | | |_) / _ \\ |  \\| |  _| | |    ${NC}"
echo -e "${WHITE}  ___) | . \\   \\ V / | |_| | |_| | |  __/ ___ \\| |\\  | |___| |___ ${NC}"
echo -e "${WHITE} |____/|_|\\_\\   \\_/  |____/ \\___/  |_| /_/   \\_\\_| \\_|_____|_____|${NC}"
echo -e "${CYAN}======================================================================${NC}"
echo -e " ${GREEN}✦ SKYDO CLOUD VPS HOSTING PANEL V5 - INSTALLATION MANAGER ✦${NC}"
echo -e " ${YELLOW}Offline File-Based DB Engine (Zero Cloud Dependencies)${NC}"
echo -e " ${BLUE}Credits: SKYDO YouTube / SKYDO Devs${NC}"
echo -e "${CYAN}======================================================================${NC}"
echo ""

# Confirm automatic installation
echo -e "${YELLOW}Automatic installation will commence on: ${WHITE}${OS^}${YELLOW}...${NC}"
echo -e "${WHITE}Press ${GREEN}[ENTER]${WHITE} to start or ${RED}[CTRL+C]${WHITE} to cancel...${NC}"
read -r

# Helper error exit function
error_exit() {
  echo -e "\n${RED}[CRITICAL ERR] $1${NC}"
  echo -e "${YELLOW}Need support? Check the SKYDO YT Channel for troubleshooting videos!${NC}"
  exit 1
}

# Get Host VPS public IP
PUBLIC_IP=$(curl -s https://api.ipify.org || echo "localhost")

# ==========================================
# STEP 1: Dependencies and System Upgrade
# ==========================================
echo -e "\n${CYAN}[1/5] Updating system packages and installing core binaries...${NC}"

if [[ "$OS" == "ubuntu" || "$OS" == "debian" ]]; then
  export DEBIAN_FRONTEND=noninteractive
  apt-get update -y || error_exit "Failed apt-get update update sequence"
  apt-get install -y curl git ufw build-essential ca-certificates gnupg dirmngr || error_exit "Failed apt installation core dependencies"
elif [[ "$OS" == "centos" || "$OS" == "rocky" || "$OS" == "rhel" ]]; then
  dnf check-update -y
  dnf groupinstall -y "Development Tools" || dnf groupinstall -y "Development tools"
  dnf install -y curl git epel-release firewalld || error_exit "Failed dnf installation core utilities"
else
  echo -e "${YELLOW}[WARN] Unknown OS profile. Attempting package manager scan fallback...${NC}"
  if command -v apt-get &> /dev/null; then
    apt-get update -y && apt-get install -y curl git build-essential ufw ca-certificates
  elif command -v dnf &> /dev/null; then
    dnf install -y curl git firewalld
  else
    error_exit "Unsupported package controller. Install curl, git, build-essential manually."
  fi
fi

echo -e "${GREEN}[SUCCESS] System utilities and compilers synchronized successfully.${NC}"

# ==========================================
# STEP 2: Node.js LTS and PM2 Installation
# ==========================================
echo -e "\n${CYAN}[2/5] Setting up Node.js 20 LTS Environment & PM2 Task Daemon...${NC}"

if ! command -v node &> /dev/null || [[ $(node -v | cut -d'v' -f2 | cut -d'.' -f1) -lt 20 ]]; then
  echo -e "${YELLOW}Node.js v20 not detected or outdated. Registering NodeSource repositories...${NC}"
  if [[ "$OS" == "ubuntu" || "$OS" == "debian" ]]; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - || error_exit "NodeSource setup initialization breakdown."
    apt-get install -y nodejs || error_exit "Node.js environment deployment abort."
  else
    curl -fsSL https://rpm.nodesource.com/setup_20.x | bash - || error_exit "NodeSource setup initialization breakdown."
    dnf install -y nodejs || error_exit "Node.js environment deployment abort."
  fi
else
  echo -e "${GREEN}Valid Node.js environment detected: $(node -v)${NC}"
fi

# NPM Config and PM2 Global deployment
echo -e "${YELLOW}Installing PM2 Process Manager globally...${NC}"
npm install -g pm2 || error_exit "Global dependency PM2 compilation crashed."

echo -e "${GREEN}[SUCCESS] Node.js and PM2 ready.${NC}"

# ==========================================
# STEP 3: Clone Skydo Hosting Repository
# ==========================================
echo -e "\n${CYAN}[3/5] Clinking remote core modules & filesystem workspace configuration...${NC}"

if [ -d "$TARGET_DIR" ]; then
  echo -e "${YELLOW}[WARN] Target folder '$TARGET_DIR' already exists. Saving backup to '${TARGET_DIR}_old'...${NC}"
  rm -rf "${TARGET_DIR}_old"
  mv "$TARGET_DIR" "${TARGET_DIR}_old"
fi

echo -e "${YELLOW}Downloading repository files from GitHub...${NC}"
git clone "$REPO_URL" "$TARGET_DIR" || error_exit "Repository synchronization failed. Check your internet connection or git source."

cd "$TARGET_DIR" || error_exit "Unable to enter the deployment directory '$TARGET_DIR'"

# Ensure data structure requirements are pre-loaded
mkdir -p data/servers
echo -e "${GREEN}[SUCCESS] Repository loaded physically and directory structures initialized successfully.${NC}"

# ==========================================
# STEP 4: Package Dependencies & Bundle compilation
# ==========================================
echo -e "\n${CYAN}[4/5] Installing NPM local dependencies & compiling production bundles...${NC}"

# Setup node environment setups
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
  else
    echo "PORT=3000" > .env
  fi
fi

npm install || error_exit "Local project dependency installation failed."

echo -e "${YELLOW}Compiling React/TypeScript code into optimized server-side modules...${NC}"
npm run build || error_exit "Production package bundling failed. Verify your TypeScript configurations."

echo -e "${GREEN}[SUCCESS] App assets and modules built successfully.${NC}"

# ==========================================
# STEP 5: Start Panel Daemon, Network & Firewall
# ==========================================
echo -e "\n${CYAN}[5/5] Launching VPS Host process services and adapting firewall tables...${NC}"

# Stop active instances under the same namespace to prevent collisions
pm2 stop "$APP_NAME" &> /dev/null || true
pm2 delete "$APP_NAME" &> /dev/null || true

# Start panel under CJS production runtime using Node.js
pm2 start dist/server.cjs --name "$APP_NAME" --env production || error_exit "PM2 deployment start aborted."

# Saving configuration & setting up startup hooks
pm2 save || true
echo -e "${YELLOW}Configuring system reboot auto-restart scripts...${NC}"
pm2 startup | tail -n 1 | bash || true

# Port access resolution
echo -e "${YELLOW}Verifying system firewalls to permit Port ${DEFAULT_PORT} ingress...${NC}"
if command -v ufw &> /dev/null && ufw status | grep -q "active"; then
  ufw allow ${DEFAULT_PORT}/tcp
  ufw reload
  echo -e "${GREEN}UFW table updated. Port ${DEFAULT_PORT} opened.${NC}"
elif command -v firewall-cmd &> /dev/null && systemctl is-active --quiet firewalld; then
  firewall-cmd --permanent --add-port=${DEFAULT_PORT}/tcp
  firewall-cmd --reload
  echo -e "${GREEN}Firewalld table updated. Port ${DEFAULT_PORT} opened.${NC}"
else
  echo -e "${YELLOW}No active firewall detected (UFW/Firewalld). Ensure port ${DEFAULT_PORT} is accessible manually.${NC}"
fi

# Flag startup success
echo -e "\n${GREEN}======================================================================${NC}"
echo -e " ${GREEN}✔ CONGRATULATIONS! SKYDO VPS HOSTING PANEL INSTALLED SUCCESSFUL!${NC}"
echo -e "${GREEN}======================================================================${NC}"
echo ""
echo -e " ${WHITE}Your premium server-management interface is active and monitoring vps virtualizations.${NC}"
echo -e " ${WHITE}All servers, files, console records, and users stored locally in this machine.${NC}"
echo ""
echo -e " ${CYAN}🖥 PANEL NETWORK DETAILS:${NC}"
echo -e "   - LOCAL URL:     ${GREEN}http://127.0.0.1:3000${NC}"
echo -e "   - PUBLIC URL:    ${GREEN}http://${PUBLIC_IP}:3000${NC}"
echo -e "   - PORT BINDING:  ${WHITE}3000 (Managed via PM2 Daemon)${NC}"
echo ""
echo -e " ${CYAN}🔑 DEFAULT ADMINISTRATOR IDENTITY:${NC}"
echo -e "   - Username:      ${GREEN}root${NC}"
echo -e "   - Standard Email:${GREEN}admin@skyport.alt${NC}"
echo -e "   - Password:      ${GREEN}Enter any matching password on the secure key entry screen${NC}"
echo ""
echo -e " ${CYAN}⚙ CORE MANAGER DIRECTIVE (PM2 COMMANDS):${NC}"
echo -e "   - View Console Logs:    ${YELLOW}pm2 logs ${APP_NAME}${NC}"
echo -e "   - Check Service Status: ${YELLOW}pm2 status ${APP_NAME}${NC}"
echo -e "   - Reboot Panel Service: ${YELLOW}pm2 restart ${APP_NAME}${NC}"
echo -e "   - Stop Panel Service:   ${YELLOW}pm2 stop ${APP_NAME}${NC}"
echo ""
echo -e " ${BLUE}✦ Subscription/Updates on SKYDO YouTube: https://youtube.com/c/SKYDO ✦${NC}"
echo -e " ${WHITE}Enjoy offline absolute control over your direct node containers.${NC}"
echo -e "${GREEN}======================================================================${NC}"
echo ""
