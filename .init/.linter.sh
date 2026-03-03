#!/bin/bash
cd /home/kavia/workspace/code-generation/two-player-tic-tac-toe-327681-327690/react_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

