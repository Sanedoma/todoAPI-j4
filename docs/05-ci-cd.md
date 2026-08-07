
# CI/CD avec GitHub Actions

## 1. Présentation

Le projet Todo API utilise GitHub Actions afin d'automatiser le cycle de livraison de l'application.

La chaîne CI/CD permet :

- de tester automatiquement le code
- de construire une image Docker
- de publier l'image sur Docker Hub
- de déployer automatiquement sur Kubernetes


Architecture globale :

```

Développeur

```
|
|
v
```

Git Push sur main

```
|
|
+----------------+
|                |
v                v
```

CI Tests       Build Docker

```
|                |
|                |
v                v
```

Jest          Docker Hub

```
                |
                |
                v

          Déploiement Kubernetes

                |
                |
                v

          Application disponible
```

```


---

# 2. Workflows GitHub Actions


Les workflows sont stockés dans :

```

.github/workflows/

```


Le projet contient :

```

.github/workflows/

├── tests.yml
├── docker.yml
├── cd.yml
└── test-trigger.yml

```


---

# 3. Workflow CI - Tests automatiques


Fichier :

```

.github/workflows/tests.yml

````


Objectif :

Vérifier que le code est fonctionnel avant toute livraison.


Déclenchement :

```yaml
on:

  push:
    branches:
      - main

  pull_request:
    branches:
      - main
````

Le workflow est exécuté :

* lors d'un push sur main
* lors d'une Pull Request vers main

---

# 4. Environnement de test

GitHub Actions crée automatiquement une base PostgreSQL temporaire.

Service utilisé :

```yaml
services:

  postgres:

    image: postgres:16
```

Variables :

```yaml
POSTGRES_USER: postgres

POSTGRES_PASSWORD: postgres

POSTGRES_DB: todo_test
```

La base est détruite automatiquement après le workflow.

---

# 5. Étapes du workflow CI

## 5.1 Récupération du code

Action utilisée :

```yaml
actions/checkout@v4
```

Permet de récupérer le dépôt Git.

---

## 5.2 Installation Node.js

Action :

```yaml
actions/setup-node@v4
```

Version :

```
Node.js 20
```

---

## 5.3 Installation des dépendances

Commande :

```bash
npm install
```

---

## 5.4 Création du schéma PostgreSQL

Commande exécutée :

```bash
psql \
-f src/database/init.sql
```

Cette étape crée la table :

```
tasks
```

---

## 5.5 Exécution des tests

Commande :

```bash
npm test
```

Si les tests échouent :

* le workflow échoue
* le déploiement est bloqué

---

# 6. Workflow Docker

Fichier :

```
.github/workflows/docker.yml
```

Objectif :

Créer une image Docker et la publier sur Docker Hub.

Déclenchement :

```yaml
on:

  push:

    branches:

      - main
```

---

# 7. Authentification Docker Hub

Action utilisée :

```yaml
docker/login-action@v3
```

Secrets nécessaires :

```
DOCKER_USERNAME

DOCKER_PASSWORD
```

Ces secrets sont configurés dans :

```
Repository Settings

    ↓

Secrets and variables

    ↓

Actions
```

---

# 8. Construction de l'image Docker

Commande :

```bash
docker build \
-t utilisateur/todo-api:${github.sha} .
```

Le tag utilisé correspond au commit Git :

Exemple :

```
todo-api:a3a2e01f5cf76cd6a248b873ac3d9ef48eab8f01
```

Cela permet :

* d'identifier précisément une version
* de revenir à une version précédente

---

# 9. Publication Docker Hub

Commande :

```bash
docker push \
utilisateur/todo-api:${github.sha}
```

L'image devient disponible pour Kubernetes.

---

# 10. Workflow CD Kubernetes

Fichier :

```
.github/workflows/cd.yml
```

Objectif :

Déployer automatiquement la nouvelle version de l'application.

Déclenchement :

```yaml
on:

 push:

   branches:

     - main
```

---

# 11. Runner utilisé

Le déploiement utilise :

```yaml
runs-on: self-hosted
```

Contrairement aux runners GitHub classiques, celui-ci tourne sur une machine contrôlée par le projet.

Il permet d'avoir accès à :

* Docker
* k3d
* kubectl
* cluster Kubernetes local

---

# 12. Installation du GitHub Runner

Le runner est installé dans :

```
/actions-runner
```

Ce dossier est ignoré par Git :

```
.gitignore
```

Contenu :

```
/actions-runner/
```

Pourquoi ?

Le runner contient :

* fichiers temporaires
* tokens
* configuration locale

Il ne doit jamais être versionné.

---

# 13. Étapes du CD

## 13.1 Checkout

```yaml
actions/checkout@v4
```

Récupération du code.

---

## 13.2 Connexion Docker Hub

```yaml
docker/login-action@v3
```

Utilise :

```
DOCKER_USERNAME

DOCKER_PASSWORD
```

---

## 13.3 Build image

Commande :

```bash
docker build \
-t user/todo-api:${github.sha} .
```

---

## 13.4 Push image

Commande :

```bash
docker push \
user/todo-api:${github.sha}
```

---

## 13.5 Import dans k3d

Commande :

```bash
k3d image import \
user/todo-api:${github.sha} \
-c todo-cluster
```

Pourquoi ?

Le cluster k3d possède son propre environnement Docker.

L'import permet aux nodes Kubernetes d'utiliser l'image.

---

# 14. Mise à jour Kubernetes

Commande :

```bash
kubectl set image deployment/todo-api \
todo-api=user/todo-api:${github.sha} \
-n todo
```

Cette commande :

* modifie l'image du Deployment
* déclenche un nouveau ReplicaSet
* réalise un rolling update

---

# 15. Vérification du déploiement

Commande :

```bash
kubectl rollout status \
deployment/todo-api \
-n todo
```

Résultat attendu :

```
deployment "todo-api" successfully rolled out
```

---

# 16. Secrets GitHub utilisés

Le projet utilise plusieurs secrets.

## Docker Hub

```
DOCKER_USERNAME

DOCKER_PASSWORD
```

Utilisés pour :

* login Docker Hub
* push des images

---

## Runner SSH (ancienne version)

Une ancienne version du CD utilisait :

```
SERVER_HOST

SERVER_USER

SERVER_PORT

SSH_PRIVATE_KEY
```

Cette méthode a été remplacée par le runner self-hosted Kubernetes.

---

# 17. Gestion des erreurs rencontrées

## Erreur : No event triggers defined in on

Cause :

Mauvaise syntaxe YAML :

```yaml
on:
```

Correction :

```yaml
"on":
```

---

## Erreur Docker login

Message :

```
Error: Password required
```

Cause :

Secret Docker Hub absent ou incorrect.

Correction :

Configurer :

```
DOCKER_USERNAME

DOCKER_PASSWORD
```

---

## Erreur Dockerfile introuvable

Message :

```
failed to read dockerfile:
Dockerfile: no such file
```

Cause :

Le runner exécutait le workflow depuis le mauvais dossier.

Correction :

Vérifier :

```bash
ls
```

et la présence de :

```
Dockerfile
```

---

# 18. Pipeline complète actuelle

```
                git push

                    |
                    v

          GitHub Actions CI

                    |
                    v

        Tests Jest + PostgreSQL

                    |
                    v

          Build Docker Image

                    |
                    v

             Docker Hub

                    |
                    v

        GitHub Actions CD

                    |
                    v

        k3d image import

                    |
                    v

        Kubernetes rollout

                    |
                    v

              Todo API
```

---

# 19. Améliorations possibles

## Ajouter une étape de sécurité

Possibilités :

* Trivy pour scanner les images Docker
* npm audit
* Dependabot

---

## Ajouter une stratégie de version

Actuellement :

```
image: todo-api:${github.sha}
```

Possible :

```
todo-api:v1.0.0
todo-api:latest
```

---

## Ajouter des environnements

Exemple :

```
develop
    |
    v
staging
    |
    v
production
```

---

# Conclusion

La chaîne CI/CD du projet permet :

✅ tests automatiques
✅ build Docker automatique
✅ publication Docker Hub
✅ déploiement Kubernetes automatique
✅ mise à jour sans intervention manuelle

Le projet dispose donc d'une chaîne DevOps complète allant du commit jusqu'au déploiement.
