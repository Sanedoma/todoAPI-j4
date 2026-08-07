
# Maintenance et évolution du projet Todo API

## 1. Introduction

Ce document décrit les opérations de maintenance, les bonnes pratiques d'évolution et les pistes d'amélioration possibles du projet Todo API.

L'objectif est de conserver une application :

- stable ;
- sécurisée ;
- facilement déployable ;
- évolutive.

---

# 2. Gestion du code source

Le projet utilise Git comme système de versionnement.

Branche principale :

```

main

```

Les modifications doivent suivre le processus :

1. Création d'une modification ;
2. Tests locaux ;
3. Commit ;
4. Push sur GitHub ;
5. Validation CI ;
6. Déploiement CD.

---

# 3. Convention des commits

Les commits suivent une convention proche de Conventional Commits.

Exemples utilisés dans le projet :

```

feat: ajout du monitoring Prometheus

feat(k8s): ajout du déploiement PostgreSQL

fix: correction workflow GitHub Actions

ci: ajout du pipeline CD Kubernetes

chore: modification configuration Docker

```

Types recommandés :

| Type | Utilisation |
|-|-|
| feat | Nouvelle fonctionnalité |
| fix | Correction de bug |
| ci | Modification pipeline CI/CD |
| docs | Documentation |
| chore | Maintenance technique |
| refactor | Modification interne sans changement fonctionnel |

---

# 4. Mise à jour des dépendances

Les dépendances Node.js sont définies dans :

```

package.json

````

Pour vérifier les dépendances obsolètes :

```bash
npm outdated
````

Pour mettre à jour :

```bash
npm update
```

Après modification :

```bash
npm test
```

doit rester fonctionnel.

---

# 5. Mise à jour des images Docker

Les images utilisées :

API :

```
sanedoma/todo-api:<tag>
```

Base :

```
postgres:16
```

Monitoring :

```
prom/prometheus:v3.5.0
grafana/grafana:latest
```

Lors d'une mise à jour :

1. Modifier les fichiers concernés ;
2. Tester localement ;
3. Rebuild l'image Docker ;
4. Déployer une nouvelle version.

---

# 6. Gestion des versions Docker

Les images Docker sont versionnées avec le SHA Git :

Exemple :

```
todo-api:198f2047eab4d440525011d1265d3f5a57c702b9
```

Avantages :

* traçabilité complète ;
* possibilité de rollback ;
* correspondance exacte avec un commit Git.

---

# 7. Maintenance Kubernetes

Le cluster Kubernetes utilisé est :

```
k3d todo-cluster
```

Vérification générale :

```bash
kubectl get all -n todo
```

---

## Vérifier les pods

Commande :

```bash
kubectl get pods -n todo
```

Résultat attendu :

```
grafana       Running
prometheus    Running
postgres      Running
todo-api      Running
```

---

## Consulter les logs

API :

```bash
kubectl logs deployment/todo-api -n todo
```

PostgreSQL :

```bash
kubectl logs deployment/postgres -n todo
```

Prometheus :

```bash
kubectl logs deployment/prometheus -n todo
```

Grafana :

```bash
kubectl logs deployment/grafana -n todo
```

---

# 8. Redémarrage d'un service

Redémarrer l'API :

```bash
kubectl rollout restart deployment/todo-api -n todo
```

Vérifier :

```bash
kubectl rollout status deployment/todo-api -n todo
```

---

# 9. Mise à jour d'une version API manuellement

Modifier l'image Kubernetes :

```bash
kubectl set image deployment/todo-api \
todo-api=sanedoma/todo-api:NOUVELLE_VERSION \
-n todo
```

Suivre le déploiement :

```bash
kubectl rollout status deployment/todo-api -n todo
```

---

# 10. Rollback Kubernetes

En cas de problème :

Voir l'historique :

```bash
kubectl rollout history deployment/todo-api -n todo
```

Retour à la version précédente :

```bash
kubectl rollout undo deployment/todo-api -n todo
```

---

# 11. Sauvegarde PostgreSQL

Les données PostgreSQL sont persistées grâce au :

```
PersistentVolumeClaim
```

Fichier :

```
k8s/postgres-pvc.yml
```

Stockage actuel :

```
1Gi
```

Pour une utilisation production :

Prévoir :

* sauvegardes automatiques ;
* stockage externe ;
* réplication PostgreSQL.

---

# 12. Sécurité

## Secrets Kubernetes

Les informations sensibles sont stockées dans :

```
k8s/secret.yml
```

Exemple :

```yaml
DB_USER
DB_PASSWORD
DB_NAME
```

Ne jamais versionner :

```
.env
```

Le fichier est ignoré grâce à :

```
.gitignore
```

---

# 13. Améliorations possibles

## Ingress Kubernetes

Actuellement :

```
kubectl port-forward
```

est utilisé.

Amélioration :

Ajouter un Ingress :

```
api.todo.local
grafana.todo.local
```

---

## HTTPS

Ajouter :

* Cert-manager ;
* certificats Let's Encrypt ;
* HTTPS automatique.

---

## Helm

Transformer les fichiers Kubernetes en chart Helm :

Exemple :

```
helm/
 └── todo-api/
```

Avantages :

* installation simplifiée ;
* gestion des versions ;
* paramètres configurables.

---

## Monitoring avancé

Améliorations possibles :

* AlertManager ;
* notifications Slack/Discord ;
* métriques PostgreSQL ;
* métriques Kubernetes.

---

## Sécurité Docker

Améliorations :

* utiliser des images fixes avec versions ;
* scanner les images :

```bash
docker scout cves image
```

* utiliser un utilisateur non-root dans le Dockerfile.

---

# 14. Évolution CI/CD

Le pipeline actuel :

```
Push GitHub
      |
      v
Tests Jest
      |
      v
Build Docker
      |
      v
Push Docker Hub
      |
      v
Import k3d
      |
      v
Déploiement Kubernetes
```

Évolutions possibles :

* ajout d'un environnement staging ;
* validation manuelle avant production ;
* stratégie Blue/Green ;
* stratégie Canary Deployment.

---

# 15. Checklist maintenance

Avant chaque livraison :

* [ ] Tests OK
* [ ] Image Docker construite
* [ ] Image poussée sur Docker Hub
* [ ] Déploiement Kubernetes réussi
* [ ] Pods Running
* [ ] Endpoint `/health` fonctionnel
* [ ] Métriques Prometheus disponibles
* [ ] Dashboard Grafana fonctionnel

---

# Conclusion

Le projet Todo API possède une base DevOps complète :

* API Node.js ;
* tests automatisés ;
* Docker ;
* Kubernetes ;
* PostgreSQL persistant ;
* Prometheus ;
* Grafana ;
* CI/CD GitHub Actions.

Cette architecture permet une évolution progressive vers une infrastructure proche d'un environnement professionnel.
