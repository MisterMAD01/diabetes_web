#!/bin/bash
# Script สำหรับ Deploy Diabetes Web Application (Node.js/SQLite + React) บน Ubuntu

# ----------------------------------------------------
# CONFIGURATION - แก้ไขโดยใช้ข้อมูลที่ให้มา
# ----------------------------------------------------
PROJECT_DIR="/var/www/diabetes_web"
GIT_REPO="https://github.com/MisterMAD01/diabetes_web"
SERVER_ADDRESS="192.168.77.183"
BACKEND_PORT="5000"
APP_NAME="diabetes_backend"

# ----------------------------------------------------
# 1. SETUP PREREQUISITES
# ----------------------------------------------------
echo "--- 1. SETTING UP PREREQUISITES (Update, NGINX, NVM/Node.js) ---"

# อัปเดตระบบและติดตั้ง NGINX
sudo apt update
sudo apt install -y curl git nginx

# ติดตั้ง NVM (Node Version Manager) และ Node.js LTS
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # Load nvm
nvm install --lts
npm install -g pm2

# ----------------------------------------------------
# 2. CLONE & BUILD CODE
# ----------------------------------------------------
echo "--- 2. CLONING CODE AND BUILDING ---"

# เตรียม Directory และสิทธิ์
sudo mkdir -p $PROJECT_DIR
sudo chown -R $USER:$USER $PROJECT_DIR
cd $PROJECT_DIR

# โคลน Repository
if [ -d .git ]; then
    echo "Pulling existing repository..."
    git pull
else
    echo "Cloning new repository..."
    git clone $GIT_REPO .
fi

# 2.1 Backend Setup (Install & DB Directory)
echo "Installing Backend dependencies..."
cd $PROJECT_DIR/backend
npm install

echo "Creating SQLite data directory..."
cd $PROJECT_DIR
mkdir -p data # สร้าง data folder สำหรับไฟล์ SQLite

# 2.2 Frontend Build
echo "Installing and Building Frontend..."
cd $PROJECT_DIR/frontend
npm install
npm run build

# ----------------------------------------------------
# 3. CONFIGURE NGINX (หน้าบ้าน)
# ----------------------------------------------------
echo "--- 3. CONFIGURING NGINX ---"

NGINX_CONF_PATH="/etc/nginx/sites-available/diabetes_web"

# สร้าง NGINX config file
sudo tee $NGINX_CONF_PATH > /dev/null <<EOL
server {
    listen 80;
    server_name ${SERVER_ADDRESS};

    # Frontend Static Files
    root ${PROJECT_DIR}/frontend/build;
    index index.html;

    # Backend API Proxy (หลังบ้าน)
    location /api/ {
        proxy_pass http://localhost:${BACKEND_PORT};
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
    
    # Backend Static Files (Export)
    location /files/ {
        alias ${PROJECT_DIR}/backend/Export/; 
    }
    
    # Backend Uploads
    location /api/user/uploads/ {
        alias ${PROJECT_DIR}/backend/controllers/user/uploads/;
    }

    # React Router Fallback
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOL

# เปิดใช้งาน NGINX config
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf $NGINX_CONF_PATH /etc/nginx/sites-enabled/

# ทดสอบและ Restart NGINX
sudo nginx -t && sudo systemctl restart nginx
echo "✅ NGINX configured and restarted."

# ----------------------------------------------------
# 4. START BACKEND SERVICE (PM2)
# ----------------------------------------------------
echo "--- 4. STARTING BACKEND SERVICE ---"

cd $PROJECT_DIR/backend
# สร้างไฟล์ restart_backend.sh ในโฟลเดอร์ backend (ถ้ายังไม่มีจากการโคลน)
echo "#!/bin/bash
APP_NAME=\"$APP_NAME\"
ENTRY_POINT=\"server.js\"
pm2 describe \$APP_NAME > /dev/null
if [ \"\$?\" -eq 0 ]; then
  pm2 restart \$APP_NAME
else
  pm2 start \$ENTRY_POINT --name \$APP_NAME 
fi
pm2 save
pm2 status \$APP_NAME" > restart_backend.sh

# ให้สิทธิ์รัน
chmod +x restart_backend.sh

# รันสคริปต์ restart_backend.sh เพื่อจัดการ PM2
./restart_backend.sh

echo "🎉 DEPLOYMENT COMPLETE! Access your site at http://${SERVER_ADDRESS}"