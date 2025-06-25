#!/bin/bash

# Setup script for Datacenter Management App
# This script helps set up the application for production
# Project location: D:/nginx/pistolas

# Exit on any error
set -e

# Color variables
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting setup for Datacenter Management App${NC}"
echo "Project location: D:/nginx/pistolas"
echo "========================================================="
echo

# Check if running as root (required for some operations)
if [ "$EUID" -ne 0 ]; then
  echo -e "${YELLOW}Warning: Some operations might require root privileges${NC}"
  echo
fi

# Print system information
echo -e "${GREEN}System Information:${NC}"
echo "Node.js Version: $(node -v)"
echo "NPM Version: $(npm -v)"
if command -v pm2 &> /dev/null; then
    echo "PM2 Version: $(pm2 -v)"
else
    echo "PM2: Not installed"
fi

CURRENT_DIR=$(pwd)
echo "Current directory: $CURRENT_DIR"
echo

# Create directories if they don't exist
echo -e "${GREEN}Creating necessary directories...${NC}"
mkdir -p logs/pm2
mkdir -p logs/nginx
mkdir -p uploads
mkdir -p uploads/excel
mkdir -p cache

# Set proper permissions
echo "Setting proper permissions on directories..."
chmod -R 755 logs
chmod -R 755 uploads
chmod -R 755 cache

# Check if .env.production file exists, copy to .env if it does
if [ -f .env.production ]; then
  echo -e "${GREEN}Creating .env file from .env.production${NC}"
  cp .env.production .env
  echo -e "${YELLOW}Copied .env.production to .env${NC}"
elif [ -f .env.example ]; then
  echo -e "${YELLOW}No .env.production found, creating .env file from .env.example${NC}"
  cp .env.example .env
  echo -e "${YELLOW}Please edit the .env file with your actual configuration${NC}"
else
  echo -e "${RED}No .env.production or .env.example file found. Please create a .env file manually.${NC}"
  exit 1
fi

# Check for server/.env file
if [ ! -f server/.env ] && [ -f server/.env.example ]; then
  echo "Creating server/.env file from server/.env.example"
  cp server/.env.example server/.env
  echo -e "${YELLOW}Please edit the server/.env file with your actual configuration${NC}"
fi

# Install dependencies
echo -e "${GREEN}Installing dependencies...${NC}"
npm install

# Build the frontend
echo -e "${GREEN}Building the frontend...${NC}"
npm run build

# Check if the build was successful
if [ -d "dist" ]; then
  echo -e "${GREEN}Build successful!${NC}"
else
  echo -e "${RED}Build failed! dist directory not found.${NC}"
  exit 1
fi

# Check if PM2 is installed globally
if ! command -v pm2 &> /dev/null; then
  echo -e "${YELLOW}Installing PM2 globally...${NC}"
  npm install -g pm2
fi

# Check if PM2 ecosystem config exists
if [ ! -f deploy/ecosystem.config.cjs ]; then
  echo -e "${RED}PM2 ecosystem config not found at deploy/ecosystem.config.cjs${NC}"
  exit 1
fi

# Create a logrotate configuration for PM2 logs
echo -e "${GREEN}Creating logrotate configuration for PM2 logs...${NC}"
LOGROTATE_CONFIG="$CURRENT_DIR/deploy/pm2-logrotate.conf"

cat > "$LOGROTATE_CONFIG" << EOL
$CURRENT_DIR/logs/pm2/*.log {
  daily
  rotate 7
  compress
  delaycompress
  missingok
  notifempty
  create 0640 $USER $USER
  sharedscripts
  postrotate
    pm2 reloadLogs
  endscript
}
EOL

echo -e "${YELLOW}PM2 logrotate configuration created at $LOGROTATE_CONFIG${NC}"
echo "To install this configuration, run: sudo cp $LOGROTATE_CONFIG /etc/logrotate.d/pm2-datacenter-app"

# Nginx configuration instructions
echo -e "${GREEN}Nginx configuration instructions:${NC}"
echo "1. The nginx.conf file has been configured for the project location: D:/nginx/pistolas"
echo "2. Copy the nginx.conf file to your Nginx configuration directory"
echo "3. Edit the nginx.conf file to match your specific server requirements:"
echo "   - Update server_name with your domain"
echo "   - Configure SSL certificates if needed"
echo "4. Test the Nginx configuration:"
echo "   nginx -t"
echo "5. Restart Nginx:"
echo "   nginx -s reload"
echo

# Start the application with PM2
echo -e "${GREEN}Starting the application with PM2...${NC}"
npm run pm2:start

# Save PM2 configuration
echo "Saving PM2 configuration..."
pm2 save

# Generate PM2 startup script
echo -e "${YELLOW}To configure PM2 to start on system boot, run:${NC}"
echo "pm2 startup"
echo "Follow the instructions provided by the command."

echo
echo -e "${GREEN}Setup completed successfully!${NC}"
echo -e "${YELLOW}Please check the logs directory for any errors.${NC}"
echo
echo -e "${GREEN}Project URLs:${NC}"
echo "- Frontend: http://localhost"
echo "- API: http://localhost/api"
echo "- Health check: http://localhost/health"
echo
echo -e "${GREEN}Useful commands:${NC}"
echo "- npm run pm2:logs   (View logs)"
echo "- npm run pm2:monit  (Monitor application)"
echo "- npm run deploy     (Rebuild frontend and restart application)"
echo