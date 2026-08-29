#!/usr/bin/env bash
# Déploie Zen2Property dans /var/www/zen2property UNIQUEMENT.
# Ne modifie aucun autre dossier d'application.
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/zen2property}"
REPO_URL="${REPO_URL:-https://github.com/Kameltalbi/zen2property.git}"
BRANCH="${BRANCH:-develop}"

echo "==> Cible isolée: $APP_DIR (autres apps non touchées)"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Lancer en root (sudo)."
  exit 1
fi

mkdir -p "$APP_DIR"
mkdir -p "$(dirname "$APP_DIR")"

if [[ ! -d "$APP_DIR/.git" ]]; then
  git clone --branch "$BRANCH" "$REPO_URL" "$APP_DIR"
else
  git -C "$APP_DIR" fetch origin
  git -C "$APP_DIR" checkout "$BRANCH"
  git -C "$APP_DIR" pull --ff-only origin "$BRANCH"
fi

cd "$APP_DIR"

if [[ ! -f .env ]]; then
  cp deploy/env.production.example .env
  echo "!! Édite $APP_DIR/.env (JWT_SECRET, POSTGRES_PASSWORD, DATABASE_URL) puis relance."
  exit 2
fi

# shellcheck disable=SC1091
set -a
source .env
set +a

if [[ -z "${JWT_SECRET:-}" || "$JWT_SECRET" == CHANGE_ME_LONG_RANDOM_SECRET_32CHARS ]]; then
  echo "!! Change JWT_SECRET dans .env"
  exit 2
fi

echo "==> Postgres Docker (projet zen2property uniquement)"
if command -v docker-compose >/dev/null 2>&1; then
  COMPOSE=(docker-compose)
elif docker compose version >/dev/null 2>&1; then
  COMPOSE=(docker compose)
else
  echo "Docker Compose introuvable"
  exit 1
fi
"${COMPOSE[@]}" -f deploy/docker-compose.prod.yml --env-file .env up -d

echo "==> Install / build"
# Types de build (devDependencies) même si NODE_ENV=production dans .env
npm ci --include=dev
npm run build
npm ci --prefix web --include=dev
npm run build:web
mkdir -p storage/receipts
chown -R www-data:www-data "$APP_DIR"
# Keep .env readable only by service user
chmod 640 "$APP_DIR/.env"
chown root:www-data "$APP_DIR/.env" || chown www-data:www-data "$APP_DIR/.env"

echo "==> Migrations"
# Attendre Postgres prêt
for i in $(seq 1 30); do
  if docker exec zen2property-postgres pg_isready -U zen2property -d zen2property >/dev/null 2>&1; then
    break
  fi
  sleep 1
done
npm run migrate
chown -R www-data:www-data "$APP_DIR/storage" || true

echo "==> Systemd (unité zen2property uniquement)"
cp deploy/zen2property.service /etc/systemd/system/zen2property.service
systemctl daemon-reload
systemctl enable zen2property
systemctl restart zen2property

echo "==> Nginx site zen2property.com (fichier dédié)"
cp deploy/nginx/zen2property.com.conf /etc/nginx/sites-available/zen2property.com
ln -sfn /etc/nginx/sites-available/zen2property.com /etc/nginx/sites-enabled/zen2property.com
nginx -t
systemctl reload nginx

echo ""
echo "OK. Ensuite DNS A/AAAA vers ce VPS, puis:"
echo "  sudo certbot --nginx -d zen2property.com -d www.zen2property.com"
echo "Health: curl -s http://127.0.0.1:3120/health"
