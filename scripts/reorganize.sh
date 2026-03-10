#!/bin/bash
# LeafDoc Project Reorganization Script for Linux/Mac
# Run this in your current leafdoc directory to reorganize the structure

echo "========================================"
echo "LeafDoc Project Reorganization Script"
echo "========================================"
echo ""

echo "Creating new directory structure..."

# Create directories
mkdir -p .github/workflows
mkdir -p backend/app/{models,routes,services,utils}
mkdir -p backend/tests
mkdir -p frontend/{public,src/{components,services,utils}}
mkdir -p ml/{models,notebooks,scripts}
mkdir -p database
mkdir -p docs
mkdir -p scripts
mkdir -p tests/e2e

echo "✓ Directories created"

echo ""
echo "Moving backend files..."

# Move backend files
[ -f "backend/main.py" ] && mv backend/main.py backend/app/main.py && echo "✓ Moved backend/main.py to backend/app/main.py"
[ -f "backend/requirements.txt" ] && echo "✓ backend/requirements.txt already in correct location"
[ -f "backend/Dockerfile" ] && echo "✓ backend/Dockerfile already in correct location"

echo ""
echo "Moving frontend files..."

# Move frontend files
[ -f "frontend/App.jsx" ] && mv frontend/App.jsx frontend/src/App.jsx && echo "✓ Moved frontend/App.jsx to frontend/src/App.jsx"
[ -f "frontend/main.jsx" ] && mv frontend/main.jsx frontend/src/main.jsx && echo "✓ Moved frontend/main.jsx to frontend/src/main.jsx"
[ -f "frontend/api.js" ] && mv frontend/api.js frontend/src/services/api.js && echo "✓ Moved frontend/api.js to frontend/src/services/api.js"
[ -f "frontend/index.html" ] && mv frontend/index.html frontend/public/index.html && echo "✓ Moved frontend/index.html to frontend/public/index.html"

echo ""
echo "Moving ML files..."

# Move ML files
[ -f "models/train_model.py" ] && mv models/train_model.py ml/scripts/train_model.py && echo "✓ Moved models/train_model.py to ml/scripts/train_model.py"

# Move remaining model files
if [ -d "models" ]; then
    echo "Moving remaining model files..."
    find models -type f -exec mv {} ml/models/ \; 2>/dev/null
fi

echo ""
echo "Moving database files..."

# Move database files
[ -f "docs/database_schema.md" ] && mv docs/database_schema.md database/schema.md && echo "✓ Moved docs/database_schema.md to database/schema.md"

echo ""
echo "Creating essential configuration files..."

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    cat > .gitignore << 'EOF'
# Python
__pycache__/
*.py[cod]
venv/
.env

# Node
node_modules/
dist/

# Models
*.h5
*.pkl

# Data
data/
*.csv

# Logs
logs/
*.log

# IDE
.vscode/
.idea/
.DS_Store
EOF
    echo "✓ Created .gitignore"
fi

# Create .env.example if it doesn't exist
if [ ! -f ".env.example" ]; then
    cat > .env.example << 'EOF'
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=plant_disease_db
REACT_APP_API_URL=http://localhost:8000
MODEL_PATH=../ml/models/plant_disease_model.h5
EOF
    echo "✓ Created .env.example"
fi

# Create __init__.py files for Python packages
touch backend/app/__init__.py
touch backend/app/models/__init__.py
touch backend/app/routes/__init__.py
touch backend/app/services/__init__.py
touch backend/app/utils/__init__.py
echo "✓ Created Python __init__.py files"

echo ""
echo "========================================"
echo "Reorganization Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Review the new structure"
echo "2. Update import paths in your code if needed"
echo "3. Test the application"
echo "4. Commit changes to Git:"
echo "   git add ."
echo "   git commit -m 'Reorganize project structure'"
echo "   git push"
echo ""
