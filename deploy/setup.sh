#!/bin/bash

# Setup script for Datacenter Management App
# This script helps set up the application for production

# Exit on any error
set -e

# Color variables
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting setup for Datacenter Management App${NC}"

# Check if running as root (required for some operations)
if [ "$EUID" -ne 0 ]; then
  echo -e "${YELLOW}Warning: Some operations might require root privileges${NC}"
fi

# Create directories if they don't exist
echo "Creating necessary directories..."
mkdir -p logs/pm2
mkdir -p uploads
mkdir -p uploads/excel

# Check if .env file exists, create from example if it doesn't
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    echo "Creating .env file from .env.example"
    cp .env.example .env
    echo -e "${YELLOW}Please edit the .env file with your actual configuration${NC}"
  else
    echo -e "${RED}No .env.example file found. Please create a .env file manually.${NC}"
    exit 1
  fi
fi

# Check for Node.js and npm
if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
  echo -e "${RED}Node.js and npm are required but not installed.${NC}"
  exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the frontend
echo "Building the frontend..."
npm run build

# Check if PM2 is installed globally
if ! command -v pm2 &> /dev/null; then
  echo "Installing PM2 globally..."
  npm install -g pm2
fi

# Nginx configuration suggestion
echo -e "${YELLOW}To configure Nginx, please copy the nginx.conf file to your Nginx sites directory:${NC}"
echo "cp deploy/nginx.conf /etc/nginx/sites-available/datacenter-app"
echo "ln -s /etc/nginx/sites-available/datacenter-app /etc/nginx/sites-enabled/"
echo -e "${YELLOW}Make sure to edit the file and replace paths and domain name before activating.${NC}"

# Start the application with PM2
echo "Starting the application with PM2..."
npm run pm2:start

echo -e "${GREEN}Setup completed successfully!${NC}"
echo -e "${YELLOW}Please check the logs directory for any errors.${NC}"