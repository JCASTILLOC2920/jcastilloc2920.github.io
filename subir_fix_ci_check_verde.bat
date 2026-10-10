@echo off
chcp 65001 > nul
echo =========================================================================
echo JC PATH LAB - APLICANDO FIX CI/CD PARA OBTENER CHECK VERDE (✔) EN GITHUB
echo =========================================================================
cd /d "C:\Users\HP\Desktop\repositorio 2\jcastilloc2920.github.io"
git status
echo.
echo Agregando .github/workflows/deploy.yml al control de versiones...
git add .github/workflows/deploy.yml
git commit -m "fix(ci): otorgar permisos contents:write y migrar runner a ubuntu-latest para check verde"
echo.
echo Subiendo cambios a GitHub origin/index.html...
git push origin index.html
echo.
echo =========================================================================
echo EXCELENTE: Revisa en 30 segundos tu repositorio: https://github.com/JCASTILLOC2920/jcastilloc2920.github.io
echo La X ROJA (❌) se convertira en un CHECK VERDE (✔).
echo =========================================================================
pause
