# Déploiement VPS isolé — www.rentelyo.com

Tout vit dans **`/var/www/rentelyo`**. Aucun autre dossier d’app n’est modifié.

## Isolation

| Ressource | Nom dédié |
|---|---|
| Dossier | `/var/www/rentelyo` |
| Docker Compose project | `rentelyo` |
| Conteneur | `rentelyo-postgres` |
| Volume | `rentelyo_pg_data` |
| Port Postgres hôte | `127.0.0.1:55433` |
| Port app | `127.0.0.1:3120` |
| Systemd | `rentelyo.service` |
| Nginx | `/etc/nginx/sites-available/rentelyo.com` |
| Domaine canonique | `https://www.rentelyo.com` |

## Prérequis VPS

- Node.js ≥ 20, npm, git, Docker + Compose plugin
- Nginx (déjà présent pour tes autres apps)
- DNS `www.rentelyo.com` + `rentelyo.com` → IP du VPS (`rentelyo.com` redirige vers www)

## Première install

```bash
# Sur le VPS, en root
sudo mkdir -p /var/www/rentelyo
# Option A — script (clone develop)
curl -fsSL https://raw.githubusercontent.com/Kameltalbi/rentelyo/develop/deploy/deploy-vps.sh -o /tmp/deploy-rentelyo.sh
# ou après clone manuel :
git clone -b develop https://github.com/Kameltalbi/rentelyo.git /var/www/rentelyo
cd /var/www/rentelyo
cp deploy/env.production.example .env
nano .env   # JWT_SECRET + POSTGRES_PASSWORD + DATABASE_URL identiques
chmod +x deploy/deploy-vps.sh
sudo ./deploy/deploy-vps.sh
sudo certbot --nginx -d www.rentelyo.com -d rentelyo.com
```

## Certificat HTTPS (`ERR_CERT_COMMON_NAME_INVALID`)

Le VPS héberge d’autres sites. Tant qu’il n’y a pas de certificat Let’s Encrypt pour Rentelyo, Chrome reçoit le certificat d’un autre vhost (ex. `hydroscan.io`) → **Votre connexion n’est pas privée**.

Sur le VPS, après le déploiement Nginx :

```bash
sudo cp /var/www/rentelyo/deploy/nginx/rentelyo.com.conf /etc/nginx/sites-available/rentelyo.com
sudo ln -sfn /etc/nginx/sites-available/rentelyo.com /etc/nginx/sites-enabled/rentelyo.com
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d www.rentelyo.com -d rentelyo.com --redirect
```

Vérifier ensuite :

```bash
echo | openssl s_client -connect www.rentelyo.com:443 -servername www.rentelyo.com 2>/dev/null \
  | openssl x509 -noout -subject -ext subjectAltName
# attendu : DNS:www.rentelyo.com
```

## Mise à jour

```bash
cd /var/www/rentelyo
sudo git pull --ff-only origin develop
sudo docker-compose -f deploy/docker-compose.prod.yml --env-file .env up -d
# (ou: docker compose … si le plugin CLI est installé)
sudo npm ci && sudo npm run build
sudo npm ci --prefix web && sudo npm run build:web
sudo npm run migrate
sudo systemctl restart rentelyo
```

## Vérifications

```bash
curl -s http://127.0.0.1:3120/health
sudo systemctl status rentelyo --no-pager
docker ps --filter name=rentelyo
```

## Ce qu’on ne touche pas

- Autres dossiers sous `/var/www/…`
- Autres fichiers `sites-available` / `sites-enabled`
- Autres conteneurs Docker / ports déjà pris
