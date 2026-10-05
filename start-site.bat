@echo off
REM Double-click this anytime the site isn't loading. It (re)starts the server.
cd /d "C:\Users\Dell\Documents\Project Building\web"
echo Starting Hairven on http://localhost:3000 ...
echo Keep this window open. Press CTRL+C to stop the site.
"C:\Program Files\nodejs\npm.cmd" start -- --port 3000
pause
