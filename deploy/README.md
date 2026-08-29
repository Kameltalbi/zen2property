# Déploiement VPS isolé — zen2property.com

Tout vit dans **`/var/www/zen2property`**. Aucun autre dossier d’app n’est modifié.

## Isolation

| Ressource | Nom dédié |
|---|---|
| Dossier | `/var/www/zen2property` |
| Docker Compose project | `zen2property` |
| Conteneur | `zen2property-postgres` |
| Volume | `zen2property_pg_data` |
| Port Postgres hôte | `127.0.0.1:55433` |
| Port app | `127.0.0.1:3100` |
| Systemd | `zen2property.service` |
| Nginx | `/etc/nginx/sites-available/zen2property.com` |

## Prérequis VPS

- Node.js ≥ 20, npm, git, Docker + Compose plugin
- Nginx (déjà présent pour tes autres apps)
- DNS `zen2property.com` + `www` → IP du VPS

## Première install

```bash
# Sur le VPS, en root
sudo mkdir -p /var/www/zen2property
# Option A — script (clone develop)
curl -fsSL https://raw.githubusercontent.com/Kameltalbi/zen2property/develop/deploy/deploy-vps.sh -o /tmp/deploy-z2p.sh
# ou après clone manuel :
git clone -b develop https://github.com/Kameltalbi/zen2property.git /var/www/zen2property
cd /var/www/zen2property
cp deploy/env.production.example .env
nano .env   # JWT_SECRET + POSTGRES_PASSWORD + DATABASE_URL identiques
chmod +x deploy/deploy-vps.sh
sudo ./deploy/deploy-vps.sh
sudo certbot --nginx -d zen2property.com -d www.zen2property.com
```

## Mise à jour

```bash
cd /var/www/zen2property
sudo git pull --ff-only origin develop
sudo docker compose -f deploy/docker-compose.prod.yml --env-file .env up -d
sudo npm ci && sudo npm run build
sudo npm ci --prefix web && sudo npm run build:web
sudo npm run migrate
sudo systemctl restart zen2property
```

## Vérifications

```bash
curl -s http://127.0.0.1:3100/health
sudo systemctl status zen2property --no-pager
docker ps --filter name=zen2property
```

## Ce qu’on ne touche pas

- Autres dossiers sous `/var/www/…`
- Autres fichiers `sites-available` / `sites-enabled`
- Autres conteneurs Docker / ports déjà pris
