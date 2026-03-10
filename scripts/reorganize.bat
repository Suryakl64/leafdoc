@echo off
REM LeafDoc Project Reorganization Script for Windows
REM Run this in your current leafdoc directory to reorganize the structure

echo ========================================
echo LeafDoc Project Reorganization Script
echo ========================================
echo.

echo Creating new directory structure...

REM Create directories
mkdir .github\workflows 2>nul
mkdir backend\app\models 2>nul
mkdir backend\app\routes 2>nul
mkdir backend\app\services 2>nul
mkdir backend\app\utils 2>nul
mkdir backend\tests 2>nul
mkdir frontend\public 2>nul
mkdir frontend\src\components 2>nul
mkdir frontend\src\services 2>nul
mkdir frontend\src\utils 2>nul
mkdir ml\models 2>nul
mkdir ml\notebooks 2>nul
mkdir ml\scripts 2>nul
mkdir database 2>nul
mkdir docs 2>nul
mkdir scripts 2>nul
mkdir tests\e2e 2>nul

echo ✓ Directories created

echo.
echo Moving backend files...

REM Move backend files
if exist "backend\main.py" (
    if not exist "backend\app" mkdir backend\app
    move backend\main.py backend\app\main.py >nul
    echo ✓ Moved backend\main.py to backend\app\main.py
)

if exist "backend\requirements.txt" (
    echo ✓ backend\requirements.txt already in correct location
)

if exist "backend\Dockerfile" (
    echo ✓ backend\Dockerfile already in correct location
)

echo.
echo Moving frontend files...

REM Move frontend files
if exist "frontend\App.jsx" (
    if not exist "frontend\src" mkdir frontend\src
    move frontend\App.jsx frontend\src\App.jsx >nul
    echo ✓ Moved frontend\App.jsx to frontend\src\App.jsx
)

if exist "frontend\main.jsx" (
    if not exist "frontend\src" mkdir frontend\src
    move frontend\main.jsx frontend\src\main.jsx >nul
    echo ✓ Moved frontend\main.jsx to frontend\src\main.jsx
)

if exist "frontend\api.js" (
    if not exist "frontend\src\services" mkdir frontend\src\services
    move frontend\api.js frontend\src\services\api.js >nul
    echo ✓ Moved frontend\api.js to frontend\src\services\api.js
)

if exist "frontend\index.html" (
    if not exist "frontend\public" mkdir frontend\public
    move frontend\index.html frontend\public\index.html >nul
    echo ✓ Moved frontend\index.html to frontend\public\index.html
)

echo.
echo Moving ML files...

REM Move ML files
if exist "models\train_model.py" (
    if not exist "ml\scripts" mkdir ml\scripts
    move models\train_model.py ml\scripts\train_model.py >nul
    echo ✓ Moved models\train_model.py to ml\scripts\train_model.py
)

if exist "models" (
    echo Moving remaining model files...
    xcopy models\*.* ml\models\ /Y >nul 2>nul
)

echo.
echo Moving database files...

REM Move database files
if exist "docs\database_schema.md" (
    if not exist "database" mkdir database
    move docs\database_schema.md database\schema.md >nul
    echo ✓ Moved docs\database_schema.md to database\schema.md
)

echo.
echo Creating essential configuration files...

REM Create .gitignore if it doesn't exist
if not exist ".gitignore" (
    (
        echo # Python
        echo __pycache__/
        echo *.py[cod]
        echo venv/
        echo .env
        echo.
        echo # Node
        echo node_modules/
        echo dist/
        echo.
        echo # Models
        echo *.h5
        echo *.pkl
        echo.
        echo # Data
        echo data/
        echo *.csv
        echo.
        echo # Logs
        echo logs/
        echo *.log
        echo.
        echo # IDE
        echo .vscode/
        echo .idea/
        echo .DS_Store
    ) > .gitignore
    echo ✓ Created .gitignore
)

REM Create .env.example if it doesn't exist
if not exist ".env.example" (
    (
        echo MONGODB_URL=mongodb://localhost:27017
        echo DATABASE_NAME=plant_disease_db
        echo REACT_APP_API_URL=http://localhost:8000
        echo MODEL_PATH=../ml/models/plant_disease_model.h5
    ) > .env.example
    echo ✓ Created .env.example
)

echo.
echo ========================================
echo Reorganization Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Review the new structure
echo 2. Update import paths in your code if needed
echo 3. Test the application
echo 4. Commit changes to Git:
echo    git add .
echo    git commit -m "Reorganize project structure"
echo    git push
echo.
echo Press any key to exit...
pause >nul
