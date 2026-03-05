#!/bin/bash

# Ports to clear
PORTS=(4000 5173 1883)


for port in "${PORTS[@]}"; do
  pid=$(lsof -t -i:"$port")
  if [ -n "$pid" ]; then
    echo "Killing process $pid on port $port"
    kill -9 $pid
  else
    echo "Port $port is clear"
  fi
done
