
# Tests de l'application Todo API

## 1. Présentation

Le projet Todo API possède plusieurs niveaux de tests afin de garantir la stabilité de l'application :

- tests d'intégration API avec Jest et Supertest
- tests de validation des erreurs
- tests automatisés dans GitHub Actions
- tests manuels après déploiement Kubernetes


L'objectif est de vérifier :

- le fonctionnement des routes HTTP
- la connexion avec PostgreSQL
- la gestion des erreurs
- la non-régression lors des déploiements


---

# 2. Frameworks utilisés


## Jest

Jest est utilisé comme framework de tests JavaScript.


Installation :

```bash
npm install --save-dev jest
````

Configuration dans :

```
package.json
```

Commande principale :

```bash
npm test
```

---

## Supertest

Supertest permet de tester directement les endpoints Express.

Utilisation :

```javascript
request(app)
.get("/health")
```

Cela permet de tester l'API sans lancer réellement le serveur HTTP.

---

# 3. Organisation des tests

Les tests sont organisés dans :

```
tests/
│
├── integration/
│   ├── health.test.js
│   ├── tasks.test.js
│   └── errors.test.js
│
└── unit/
```

---

# 4. Tests Health Check

Fichier :

```
tests/integration/health.test.js
```

Objectif :

Vérifier que l'API répond correctement.

Endpoint testé :

```
GET /health
```

Test réalisé :

```javascript
expect(response.statusCode)
.toBe(200)
```

Vérifications :

```javascript
response.body.status === "ok"

response.body.service === "todo-api"
```

Résultat attendu :

```json
{
    "status":"ok",
    "service":"todo-api"
}
```

---

# 5. Tests CRUD des tâches

Fichier :

```
tests/integration/tasks.test.js
```

Ces tests vérifient toutes les opérations CRUD.

---

# 5.1 Récupération des tâches

Route :

```
GET /api/tasks
```

Vérification :

```javascript
statusCode === 200
```

La réponse doit être un tableau :

```javascript
expect(response.body)
.toBeInstanceOf(Array)
```

---

# 5.2 Création d'une tâche

Route :

```
POST /api/tasks
```

Payload :

```json
{
    "title":"Faire un test automatique"
}
```

Résultat attendu :

Code HTTP :

```
201 Created
```

Réponse :

```json
{
    "title":"Faire un test automatique",
    "completed":false
}
```

---

# 5.3 Suppression d'une tâche

Route :

```
DELETE /api/tasks/:id
```

Cas valide :

```
DELETE /api/tasks/1
```

Résultat attendu :

```
200 OK
```

---

Cas inexistant :

```
DELETE /api/tasks/999
```

Résultat attendu :

```
404 Not Found
```

Réponse :

```json
{
    "message":"Task not found"
}
```

---

# 5.4 Modification d'une tâche

Route :

```
PUT /api/tasks/:id
```

Payload :

```json
{
    "title":"Apprendre Jest",
    "completed":true
}
```

Résultat attendu :

```
200 OK
```

Réponse :

```json
{
    "title":"Apprendre Jest",
    "completed":true
}
```

---

# 6. Tests de validation des erreurs

Fichier :

```
tests/integration/errors.test.js
```

Objectif :

Vérifier que l'API refuse les données invalides.

Cas testé :

Création d'une tâche sans titre.

Requête :

```json
{}
```

Endpoint :

```
POST /api/tasks
```

Résultat attendu :

```
400 Bad Request
```

Réponse :

```json
{
    "message":"Title is required"
}
```

---

# 7. Base de données de test

Les tests utilisent une base PostgreSQL dédiée :

```
todo_test
```

Configuration :

```env
NODE_ENV=test

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=todo_test
```

---

# 8. Initialisation du schéma de test

Avant les tests :

```bash
PGPASSWORD=postgres psql \
-h localhost \
-U postgres \
-d todo_test \
-f src/database/init.sql
```

Cette commande crée la table :

```sql
tasks
```

Structure :

```sql
CREATE TABLE tasks (

id SERIAL PRIMARY KEY,

title VARCHAR(255) NOT NULL,

completed BOOLEAN DEFAULT false

);
```

---

# 9. Exécution locale des tests

Installation :

```bash
npm install
```

Lancement :

```bash
npm test
```

Résultat attendu :

```
PASS tests/integration/tasks.test.js

PASS tests/integration/health.test.js

PASS tests/integration/errors.test.js
```

---

# 10. Tests dans GitHub Actions

Les tests sont automatisés via :

```
.github/workflows/tests.yml
```

Déclencheurs :

```yaml
on:

 push:
   branches:
     - main

 pull_request:
   branches:
     - main
```

Le workflow réalise :

1. Récupération du code

```yaml
actions/checkout@v4
```

2. Installation Node.js

```yaml
actions/setup-node@v4
```

Version utilisée :

```
Node.js 20
```

3. Installation dépendances

```bash
npm install
```

4. Création PostgreSQL temporaire

GitHub Actions lance automatiquement :

```
postgres:16
```

5. Initialisation base

```bash
psql -f src/database/init.sql
```

6. Exécution Jest

```bash
npm test
```

---

# 11. Workflow de test manuel Kubernetes

Après déploiement :

## Vérifier les pods

```bash
kubectl get pods -n todo
```

Résultat attendu :

```
todo-api       Running
postgres       Running
prometheus     Running
grafana        Running
```

---

# 12. Test de l'API déployée

Port forwarding :

```bash
kubectl port-forward \
-n todo \
service/todo-api \
3000:3000
```

Test racine :

```bash
curl http://localhost:3000/
```

Réponse :

```
Bienvenue sur la Todo API !
```

---

Health check :

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

# 13. Tests CRUD en environnement Kubernetes

## Création

```bash
curl \
-X POST \
-H "Content-Type: application/json" \
-d "{\"title\":\"Test Kubernetes\"}" \
http://localhost:3000/api/tasks
```

---

## Lecture

```bash
curl \
http://localhost:3000/api/tasks
```

---

## Modification

```bash
curl \
-X PUT \
-H "Content-Type: application/json" \
-d "{\"completed\":true}" \
http://localhost:3000/api/tasks/1
```

---

## Suppression

```bash
curl \
-X DELETE \
http://localhost:3000/api/tasks/1
```

---

# 14. Tests CI/CD

La chaîne complète est :

```
Modification code

        |

        v

Pull Request

        |

        v

Tests GitHub Actions

        |

        v

Merge main

        |

        v

Build Docker Image

        |

        v

Push Docker Hub

        |

        v

Déploiement Kubernetes
```

---

# 15. Workflow de test de déclenchement

Fichier :

```
.github/workflows/test-trigger.yml
```

Ce workflow permet de vérifier que GitHub Actions fonctionne.

Déclenchement manuel :

```
workflow_dispatch
```

Commande exécutée :

```bash
echo "GitHub Actions fonctionne"
```

---

# 16. Résumé des tests

| Type            | Outil              | Objectif                  |
| --------------- | ------------------ | ------------------------- |
| Unitaires       | Jest               | Tester la logique interne |
| Intégration     | Jest + Supertest   | Tester les routes API     |
| Base de données | PostgreSQL         | Vérifier CRUD             |
| CI              | GitHub Actions     | Automatisation            |
| Kubernetes      | kubectl/curl       | Vérifier déploiement      |
| Monitoring      | Prometheus/Grafana | Vérifier métriques        |

---

# Conclusion

Le projet dispose d'une couverture de tests automatisée permettant :

* de détecter rapidement les régressions
* de sécuriser les déploiements
* de valider l'application avant mise en production

Les tests sont intégrés dans la chaîne DevOps afin que chaque modification puisse être contrôlée automatiquement.

