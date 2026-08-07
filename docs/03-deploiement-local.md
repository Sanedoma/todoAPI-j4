
# Déploiement local du projet Todo API

## 1. Introduction

Ce document décrit les différentes méthodes permettant de déployer le projet Todo API en environnement local.

Deux modes sont disponibles :

- Déploiement Docker Compose (environnement de développement)
- Déploiement Kubernetes avec k3d (environnement proche production)

---

# 2. Prérequis

Avant de commencer, installer :

## Node.js

Version recommandée :

```

Node.js 20+

````

Vérification :

```bash
node --version
````

---

## Docker

Vérification :

```bash
docker --version
```

Docker Compose :

```bash
docker compose version
```

---

## Kubernetes local

Pour le déploiement Kubernetes :

* kubectl
* k3d

Vérification :

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
git clone <URL_DU_REPO>
```

Entrer dans le dossier :

```bash
cd todoAPI-j4
```

---

# 4. Configuration des variables d'environnement

Créer le fichier :

```bash
.env
```

à partir du modèle :

```bash
.env.exemple
```

Exemple :

```env
DB_HOST=postgres
DB_USER=todo
DB_PASSWORD=todo_password
DB_NAME=todo
DB_PORT=5432
```

Ces variables sont utilisées par :

* l'API Node.js ;
* PostgreSQL ;
* Docker Compose.

---

# 5. Déploiement local avec Docker Compose

## 5.1 Construction des conteneurs

Lancer :

```bash
docker compose up --build
```

Cette commande :

* construit l'image API ;
* démarre PostgreSQL ;
* initialise la base ;
* démarre l'application.

---

## 5.2 Vérification des conteneurs

Afficher les services actifs :

```bash
docker ps
```

Résultat attendu :

```
todo-api
todo-postgres
```

---

# 6. Tester l'API en local

L'API est disponible sur :

```
http://localhost:3000
```

Test simple :

```bash
curl http://localhost:3000/
```

Réponse attendue :

```
Bienvenue sur la Todo API !
```

---

## Health Check

Commande :

```bash
curl http://localhost:3000/health
```

Réponse attendue :

```json
{
  "status":"ok",
  "service":"todo-api"
}
```

---

## Tester les tâches

Lister les tâches :

```bash
curl http://localhost:3000/api/tasks
```

Créer une tâche :

```bash
curl -X POST http://localhost:3000/api/tasks \
-H "Content-Type: application/json" \
-d "{\"title\":\"Nouvelle tâche\"}"
```

---

# 7. Arrêter Docker Compose

Arrêter les services :

```bash
docker compose down
```

Supprimer également les volumes :

```bash
docker compose down -v
```

Attention :

Cette commande supprime les données PostgreSQL locales.

---

# 8. Déploiement Kubernetes local avec k3d

## 8.1 Création du cluster

Créer le cluster Kubernetes :

```bash
k3d cluster create todo-cluster \
--servers 1 \
--agents 2 \
--api-port 127.0.0.1:6550 \
--port "80:80@loadbalancer"
```

Vérifier :

```bash
kubectl get nodes
```

Résultat attendu :

```
k3d-todo-cluster-server
k3d-todo-cluster-agent
```

---

# 9. Déploiement des ressources Kubernetes

## Namespace

```bash
kubectl apply -f k8s/namespace.yml
```

---

## Secrets et configuration

```bash
kubectl apply -f k8s/secret.yml
```

```bash
kubectl apply -f k8s/configmap.yml
```

---

## PostgreSQL

Déploiement du stockage :

```bash
kubectl apply -f k8s/postgres-pvc.yml
```

Initialisation SQL :

```bash
kubectl apply -f k8s/postgres-init.yml
```

Service :

```bash
kubectl apply -f k8s/postgres-service.yml
```

Déploiement :

```bash
kubectl apply -f k8s/postgres-deployment.yml
```

---

## API Todo

Service :

```bash
kubectl apply -f k8s/api-service.yml
```

Déploiement :

```bash
kubectl apply -f k8s/api-deployment.yml
```

---

## Prometheus

Configuration :

```bash
kubectl apply -f k8s/prometheus-configmap.yml
```

Déploiement :

```bash
kubectl apply -f k8s/prometheus-deployment.yml
```

Service :

```bash
kubectl apply -f k8s/prometheus-service.yml
```

---

## Grafana

Configuration datasource :

```bash
kubectl apply -f k8s/grafana-configmap.yml
```

Déploiement :

```bash
kubectl apply -f k8s/grafana-deployment.yml
```

Service :

```bash
kubectl apply -f k8s/grafana-service.yml
```

---

# 10. Vérification Kubernetes

Afficher toutes les ressources :

```bash
kubectl get all -n todo
```

Résultat attendu :

```
pod/postgres       Running
pod/todo-api       Running
pod/prometheus     Running
pod/grafana        Running
```

---

# 11. Accéder aux services

## API

Forward du service :

```bash
kubectl port-forward \
-n todo \
service/todo-api \
3000:3000
```

Disponible :

```
http://localhost:3000
```

---

## Prometheus

```bash
kubectl port-forward \
-n todo \
service/prometheus \
9090:9090
```

Disponible :

```
http://localhost:9090
```

---

## Grafana

```bash
kubectl port-forward \
-n todo \
service/grafana \
3001:3000
```

Disponible :

```
http://localhost:3001
```

Identifiants par défaut :

```
username: admin
password: admin
```

---

# 12. Chargement du dashboard Grafana

Le dashboard est disponible dans :

```
k8s/dashboard-1786115529124.json
```

Importer dans Grafana :

1. Ouvrir Grafana ;
2. Aller dans Dashboards ;
3. Import Dashboard ;
4. Charger le fichier JSON ;
5. Sélectionner la datasource Prometheus.

---

# 13. Nettoyage du cluster

Supprimer toutes les ressources :

```bash
kubectl delete namespace todo
```

Supprimer le cluster k3d :

```bash
k3d cluster delete todo-cluster
```

---

# 14. Résumé des ports locaux

| Service           | Port |
| ----------------- | ---- |
| API               | 3000 |
| Grafana           | 3001 |
| Prometheus        | 9090 |
| PostgreSQL Docker | 5433 |

---

# Conclusion

Le projet peut être exécuté localement selon deux approches :

* Docker Compose pour le développement rapide ;
* Kubernetes/k3d pour reproduire une infrastructure proche production.

Le déploiement Kubernetes inclut :

* PostgreSQL avec stockage persistant ;
* API Node.js ;
* Prometheus ;
* Grafana ;
* supervision des métriques.

```

Je rajouterais aussi un petit fichier **`10-procedure-release.md`** après celui-ci, parce que ton projet a un vrai cycle de livraison :

```

Modification code
↓
Tests GitHub Actions
↓
Build Docker
↓
Push Docker Hub
↓
Déploiement Kubernetes
↓
Vérification Grafana/API

```

