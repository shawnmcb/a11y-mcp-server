#!/bin/bash
# NFSN daemon startup script for a11y-mcp-server

cd /home/protected/a11y-mcp-server
export NODE_ENV=production
export PORT=8080

# Log startup
echo "$(date): Starting a11y-mcp-server" >> /home/protected/a11y-mcp-server/daemon.log

# Run with error handling and restart on crash
while true; do
    node dist/index.js 2>&1 | tee -a /home/protected/a11y-mcp-server/daemon.log
    echo "$(date): Server crashed, restarting in 5 seconds..." >> /home/protected/a11y-mcp-server/daemon.log
    sleep 5
done
