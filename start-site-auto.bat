@echo off
REM Auto-start entry for Windows Task Scheduler (runs hidden at logon, no pause).
cd /d "C:\Users\Dell\Documents\Project Building\web"
"C:\Program Files\nodejs\npm.cmd" start -- --port 3000
