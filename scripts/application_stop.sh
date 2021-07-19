#!/bin/bash
echo "Stopping existing node servers"
pkill node
pm2 stop all
pm2 del all