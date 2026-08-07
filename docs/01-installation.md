
# Installation du projet Todo API

## 1. Présentation

Ce document décrit l'installation complète du projet **Todo API** en environnement de développement.

Le projet est une API REST développée avec :

- Node.js / Express
- PostgreSQL
- Docker
- Kubernetes (k3d)
- Prometheus
- Grafana
- GitHub Actions CI/CD

---

# 2. Prérequis

Avant de commencer, installer les outils suivants.

## Node.js

Version recommandée :

```

Node.js >= 20

````

Vérification :

```bash
node --version
````

Exemple :

```
v20.x.x
```

---

## npm

Vérification :

```bash
npm --version
```

---

## Git

Vérification :

```bash
git --version
```

---

## Docker

Docker est utilisé pour construire les images et lancer les services conteneurisés.

Vérification :

```bash
docker --version
```

Tester Docker :

```bash
docker run hello-world
```

---

## Docker Compose

Vérification :

```bash
docker compose version
```

---

## Kubernetes

Le projet utilise Kubernetes via k3d.

Installer :

* kubectl
* k3d

Vérifications :

```bash
kubectl version --client
```

```bash
k3d version
```

---

# 3. Récupération du projet

Cloner le repository :

```bash
git clone <URL_DU_REPOSITORY>
```

Entrer dans le dossier :

```bash
cd todoAPI-j4
```

Vérifier la branche :

```bash
git branch
```

La branche principale utilisée est :

```
main
```

---

# 4. Installation des dépendances Node.js

Installer les packages :

```bash
npm install
```

Les dépendances installées sont définies dans :

```
package.json
```

Le dossier généré :

```
node_modules/
```

est ignoré par Git.

---

# 5. Configuration des variables d'environnement

Le projet utilise des variables d'environnement pour la connexion PostgreSQL.

Copier le fichier exemple :

```bash
cp .env.exemple .env
```

Sous Windows PowerShell :

```powershell
copy .env.exemple .env
```

---

Modifier ensuite le fichier `.env` :

Exemple développement local :

```env
DB_HOST=localhost
DB_USER=todo
DB_PASSWORD=todo_password
DB_NAME=todo
DB_PORT=5432
```

---

Exemple environnement Kubernetes :

```env
DB_HOST=postgres
DB_USER=todo
DB_PASSWORD=todo_password
DB_NAME=todo
DB_PORT=5432
```

Dans Kubernetes, le host PostgreSQL correspond au nom du Service :

```
postgres
```

---

# 6. Lancement en développement local

Deux modes sont disponibles :

* lancement Node.js direct
* lancement Docker Compose

---

# 7. Lancement avec Node.js

Démarrer PostgreSQL :

```bash
docker compose up postgres
```

Puis lancer l'API :

```bash
npm start
```

L'API démarre sur :

```
http://localhost:3000
```

---

# 8. Lancement complet avec Docker Compose

Construire et démarrer les services :

```bash
docker compose up --build
```

Services démarrés :

| Service    | Port |
| ---------- | ---- |
| Todo API   | 3000 |
| PostgreSQL | 5433 |

---

Vérifier les conteneurs :

```bash
docker ps
```

Résultat attendu :

```
todo-api
todo-postgres
```

---

Arrêter les services :

```bash
docker compose down
```

---

# 9. Vérification de l'installation

Tester l'API :

```bash
curl http://localhost:3000/
```

Réponse attendue :

```
Bienvenue sur la Todo API !
```

---

Tester le health check :

```bash
curl http://localhost:3000/health
```

Réponse :

```json
{
  "status":"ok",
  "service":"todo-api"
}
```

---

Tester les métriques Prometheus :

```bash
curl http://localhost:3000/metrics
```

Réponse :

```
http_requests_total
http_request_duration_seconds
```

---

# 10. Structure principale du projet

```
todoAPI-j4

├── src
│   ├── database
│   ├── middleware
│   ├── models
│   ├── routes
│   └── app.js
│
├── tests
│   ├── integration
│   └── unit
│
├── k8s
│   └── manifests Kubernetes
│
├── devops
│   ├── prometheus
│   └── vm
│
├── Dockerfile
├── docker-compose.yml
├── docker-compose.prod.yml
└── .github/workflows
```

---

# 11. Vérification Git

Avant toute modification :

```bash
git status
```

Voir l'historique :

```bash
git log --oneline
```

Exemple des commits principaux :

```
feat: deploy todo API stack on Kubernetes
feat: deploy grafana monitoring stack
ci: add kubernetes continuous deployment
fix: adapt cd workflow for powershell runner
```

---

# 12. Nettoyage après installation

Pour supprimer les conteneurs locaux :

```bash
docker compose down
```

Pour supprimer également les volumes :

```bash
docker compose down -v
```

Attention :

Cette commande supprime les données PostgreSQL locales.

---

# 13. Résumé installation rapide

Installation complète :

```bash
git clone <repository>

cd todoAPI-j4

npm install

copy .env.exemple .env

docker compose up --build
```

L'API est ensuite disponible :

```
http://localhost:3000
```


