@echo off
REM Hairven backup (run on your laptop before deploying / weekly after).
REM Produces backups\hairven-YYYYMMDD-HHMMSS\ with database.dump + uploads.zip
setlocal enabledelayedexpansion
cd /d "C:\Users\Dell\Documents\Project Building"
for /f %%t in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd-HHmmss"') do set STAMP=%%t
set OUT=backups\hairven-%STAMP%
mkdir "%OUT%" 2>nul
echo [1/2] Dumping database...
set PGPASSWORD=postgres
"C:\Program Files\PostgreSQL\17\bin\pg_dump.exe" -U postgres -h localhost -Fc hair_heaven -f "%OUT%\database.dump"
echo [2/2] Archiving uploads...
powershell -NoProfile -Command "Compress-Archive -Path 'web\public\uploads\*' -DestinationPath '%OUT%\uploads.zip' -Force"
echo Done: %OUT%
echo Copy this folder to the VPS during deploy (see DEPLOY.md).
