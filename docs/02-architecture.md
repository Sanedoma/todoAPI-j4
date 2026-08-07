
# Architecture du projet Todo API

## 1. Vue globale

Le projet **Todo API** est une application backend REST conteneurisée et déployée selon une architecture DevOps complète.

L'architecture comprend :

- Une API REST Node.js / Express
- Une base de données PostgreSQL
- Une stack de monitoring Prometheus + Grafana
- Une orchestration Kubernetes via k3d
- Une chaîne CI/CD avec GitHub Actions
- Une publication d'image Docker

---

# 2. Architecture générale

Vue d'ensemble :

```

```
                    GitHub Repository
                           |
                           |
                     GitHub Actions
                           |
          +----------------+----------------+
          |                                 |
         CI                                CD
          |                                 |
    Tests automatisés                Build Docker image
          |                                 |
    PostgreSQL test                 Push Docker Hub
                                          |
                                          |
                                   Import k3d image
                                          |
                                          |
                                  Kubernetes Cluster
                                          |
          +-------------------------------+----------------+
          |                               |                |
      Todo API                       PostgreSQL        Monitoring
    Deployment                       Deployment        Stack
          |                               |                |
      Service                         PVC             Prometheus
          |                               |                |
      Port 3000                    Persistent       Grafana
                                   Storage
```

```

---

# 3. Application Todo API

## Technologies utilisées

| Élément | Technologie |
|-|-|
| Langage | JavaScript |
| Runtime | Node.js |
| Framework | Express |
| Tests | Jest + Supertest |
| Base de données | PostgreSQL |
| Conteneurisation | Docker |
| Orchestration | Kubernetes |

---

# 4. Architecture applicative

L'application est organisée en plusieurs couches.

```

src/

├── app.js

├── routes/
│   ├── tasks.js
│   └── health.js

├── models/
│   └── task.js

├── database/
│   ├── db.js
│   └── init.sql

└── middleware/
├── logger.js
├── metrics.js
├── errorHandler.js
└── validateTask.js

```

---

# 5. Entrée de l'application

Fichier :

```

src/app.js

```

Responsabilités :

- Initialisation Express
- Chargement des middlewares
- Déclaration des routes
- Activation des métriques Prometheus
- Gestion globale des erreurs

Routes principales :

| Route | Description |
|-|-|
| `/` | Page d'accueil API |
| `/health` | Vérification état API |
| `/metrics` | Métriques Prometheus |
| `/api/tasks` | CRUD tâches |

---

# 6. Base de données PostgreSQL

La base PostgreSQL stocke les tâches.

Structure :

```

PostgreSQL

└── todo

```
└── tasks

    ├── id
    ├── title
    └── completed
```

```

Création automatique :

```

src/database/init.sql

````

Contenu :

```sql
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT false
);
````

---

# 7. Docker

Le projet possède deux modes Docker.

## Développement

Fichier :

```
docker-compose.yml
```

Services :

```
api
 |
 postgres
```

Utilisation :

```bash
docker compose up --build
```

---

## Production

Fichier :

```
docker-compose.prod.yml
```

Services :

```
todo-api

postgres

prometheus

grafana
```

Cette configuration utilise une image Docker déjà construite.

---

# 8. Image Docker

Construction :

```
Dockerfile
```

Processus :

```
Code source

      |
      v

Docker build

      |
      v

Image todo-api

      |
      v

Docker Hub

      |
      v

Kubernetes
```

Nom d'image utilisé :

```
<docker-user>/todo-api:<commit-sha>
```

Exemple :

```
sanedoma/todo-api:6913f1a
```

---

# 9. Architecture Kubernetes

Le cluster Kubernetes utilise :

```
k3d
```

k3d permet d'exécuter Kubernetes dans Docker.

Création du cluster :

```bash
k3d cluster create todo-cluster \
--servers 1 \
--agents 2 \
--api-port 127.0.0.1:6550 \
--port "80:80@loadbalancer"
```

---

# 10. Namespace Kubernetes

Tous les composants applicatifs sont regroupés dans :

```
namespace todo
```

Création :

```
k8s/namespace.yml
```

Vérification :

```bash
kubectl get namespace
```

---

# 11. Déploiement Kubernetes

Architecture :

```
Namespace todo


├── todo-api

│   ├── Deployment

│   └── Service


├── postgres

│   ├── Deployment

│   ├── Service

│   ├── PVC

│   └── Secret


├── prometheus

│   ├── Deployment

│   ├── Service

│   └── ConfigMap


└── grafana

    ├── Deployment

    ├── Service

    └── ConfigMap
```

---

# 12. Todo API Kubernetes

Fichiers :

```
k8s/api-deployment.yml
k8s/api-service.yml
```

Déploiement :

```
Deployment
      |
      |
   Pod todo-api
      |
      |
 Service ClusterIP
```

Le service interne :

```
todo-api:3000
```

est utilisé par :

* Prometheus
* les autres composants Kubernetes

---

# 13. PostgreSQL Kubernetes

Fichiers :

```
postgres-deployment.yml
postgres-service.yml
postgres-pvc.yml
postgres-init.yml
secret.yml
```

Architecture :

```
PostgreSQL Pod

      |

PersistentVolumeClaim

      |

Storage Kubernetes
```

Les identifiants sont stockés dans :

```
Secret Kubernetes
```

---

# 14. Monitoring

Stack :

```
API

 |

/metrics

 |

Prometheus

 |

Grafana
```

---

## Prometheus

Configuration :

```
k8s/prometheus-configmap.yml
```

Scraping :

```yaml
targets:
 - todo-api:3000
```

Prometheus collecte :

* nombre de requêtes
* temps de réponse
* consommation CPU Node.js

---

## Grafana

Configuration :

```
k8s/grafana-configmap.yml
```

Datasource automatique :

```
Prometheus
```

Dashboard :

```
k8s/dashboard-1786115529124.json
```

Métriques affichées :

* nombre de requêtes
* requêtes par route
* temps moyen
* CPU Node

---

# 15. CI/CD

Le projet utilise GitHub Actions.

Workflow disponibles :

```
.github/workflows

├── tests.yml

├── docker.yml

├── cd.yml

└── test-trigger.yml
```

---

# CI

Fichier :

```
tests.yml
```

Déclenchement :

```
push main
pull request main
```

Actions :

```
Checkout

↓

Installation Node.js

↓

Installation dépendances

↓

Création PostgreSQL test

↓

npm test
```

---

# Build Docker

Fichier :

```
docker.yml
```

Actions :

```
Checkout

↓

Login Docker Hub

↓

docker build

↓

docker push
```

---

# Continuous Deployment

Fichier :

```
cd.yml
```

Déclenchement :

```
push main
```

Actions :

```
Checkout

↓

Build image Docker

↓

Push Docker Hub

↓

Import image dans k3d

↓

kubectl set image

↓

Rollout Kubernetes
```

---

# 16. Flux complet d'une modification

Lorsqu'un développeur pousse du code :

```
git push

   |

GitHub Actions

   |

Tests automatiques

   |

Build Docker

   |

Push image

   |

Déploiement Kubernetes

   |

Nouvelle version API disponible
```

---

# 17. Objectifs DevOps réalisés

Le projet met en place :

✅ Application conteneurisée
✅ Base PostgreSQL persistante
✅ Déploiement Kubernetes
✅ Configuration déclarative YAML
✅ Monitoring Prometheus
✅ Dashboard Grafana
✅ Tests automatisés
✅ Build Docker automatique
✅ Déploiement continu
✅ Gestion des secrets GitHub/Kubernetes


