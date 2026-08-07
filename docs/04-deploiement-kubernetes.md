
# Déploiement Kubernetes

## 1. Présentation

Le projet Todo API est déployé sur un cluster Kubernetes local utilisant **k3d**.

Kubernetes permet de gérer :

- le déploiement des conteneurs
- la communication entre services
- la persistance des données
- la configuration des applications
- la mise à jour automatique des versions


Architecture Kubernetes :


```
             k3d Cluster
                 |
                 |
              Namespace
                todo
                 |
 +---------------+---------------+
 |               |               |
 v               v               v
```

Todo API       PostgreSQL      Monitoring

Deployment     Deployment      Prometheus

Service        Service         Grafana

```
                 |
                 |
                 v

          Persistent Storage
```

````


---

# 2. Création du cluster k3d


Le cluster Kubernetes utilisé est créé avec k3d.


Commande :

```bash
k3d cluster create todo-cluster \
--servers 1 \
--agents 2 \
--api-port 127.0.0.1:6550 \
--port "80:80@loadbalancer"
````

Explication :

| Paramètre   | Rôle                             |
| ----------- | -------------------------------- |
| --servers 1 | nombre de nœuds control-plane    |
| --agents 2  | nombre de workers                |
| --api-port  | accès API Kubernetes             |
| --port      | exposition HTTP du load balancer |

Vérification :

```bash
kubectl cluster-info
```

Voir les nodes :

```bash
kubectl get nodes
```

Résultat attendu :

```
NAME                         STATUS
k3d-todo-cluster-server-0    Ready
k3d-todo-cluster-agent-0     Ready
k3d-todo-cluster-agent-1     Ready
```

---

# 3. Namespace Kubernetes

Toutes les ressources du projet sont isolées dans :

```
namespace todo
```

Fichier :

```
k8s/namespace.yml
```

Création :

```bash
kubectl apply -f k8s/namespace.yml
```

Vérification :

```bash
kubectl get namespaces
```

Résultat :

```
todo
```

---

# 4. Organisation des fichiers Kubernetes

Le dossier :

```
k8s/
```

contient :

```
k8s/

├── namespace.yml

├── secret.yml

├── configmap.yml


Application

├── api-deployment.yml
├── api-service.yml


Base de données

├── postgres-deployment.yml
├── postgres-service.yml
├── postgres-pvc.yml
├── postgres-init.yml


Monitoring

├── prometheus-configmap.yml
├── prometheus-deployment.yml
├── prometheus-service.yml

├── grafana-configmap.yml
├── grafana-deployment.yml
├── grafana-service.yml
```

---

# 5. Secrets Kubernetes

Fichier :

```
k8s/secret.yml
```

Les informations sensibles PostgreSQL sont stockées dans un Secret Kubernetes.

Contenu :

```yaml
stringData:

  DB_USER: todo

  DB_PASSWORD: todo_password

  DB_NAME: todo
```

Création :

```bash
kubectl apply -f k8s/secret.yml
```

Vérification :

```bash
kubectl get secrets -n todo
```

---

# 6. ConfigMap API

Fichier :

```
k8s/configmap.yml
```

Contient la configuration non sensible.

Exemple :

```yaml
data:

  DATABASE_HOST: postgres

  DATABASE_PORT: "5432"
```

Utilisation :

Le service PostgreSQL est découvert automatiquement grâce au DNS Kubernetes.

Nom utilisé :

```
postgres
```

---

# 7. Déploiement PostgreSQL

## 7.1 Deployment

Fichier :

```
k8s/postgres-deployment.yml
```

Image utilisée :

```
postgres:16
```

Le pod contient :

* serveur PostgreSQL
* variables d'environnement
* stockage persistant
* script d'initialisation

---

## 7.2 Initialisation base

Fichier :

```
k8s/postgres-init.yml
```

Le fichier SQL crée automatiquement :

```sql
CREATE TABLE tasks (

id SERIAL PRIMARY KEY,

title VARCHAR(255) NOT NULL,

completed BOOLEAN DEFAULT false

);
```

Le fichier est monté dans :

```
/docker-entrypoint-initdb.d/init.sql
```

PostgreSQL l'exécute automatiquement au premier démarrage.

---

## 7.3 Stockage persistant

Fichier :

```
k8s/postgres-pvc.yml
```

Création :

```bash
kubectl apply -f k8s/postgres-pvc.yml
```

Le volume :

```
postgres-pvc
```

permet de conserver les données même après suppression du pod.

Vérification :

```bash
kubectl get pvc -n todo
```

Résultat :

```
postgres-pvc   Bound
```

---

# 8. Service PostgreSQL

Fichier :

```
k8s/postgres-service.yml
```

Type :

```
ClusterIP
```

Le service expose :

```
postgres:5432
```

Les autres pods communiquent avec PostgreSQL via :

```
postgres
```

---

# 9. Déploiement Todo API

## 9.1 Deployment

Fichier :

```
k8s/api-deployment.yml
```

Responsabilités :

* créer le pod API
* gérer les replicas
* définir l'image Docker

Image :

```
sanedoma/todo-api:<commit_sha>
```

Port :

```
3000
```

---

## 9.2 Service API

Fichier :

```
k8s/api-service.yml
```

Type :

```
ClusterIP
```

Expose :

```
todo-api:3000
```

Les autres services Kubernetes utilisent :

```
http://todo-api:3000
```

---

# 10. Déploiement complet Kubernetes

Application des fichiers :

Namespace :

```bash
kubectl apply -f k8s/namespace.yml
```

Secrets :

```bash
kubectl apply -f k8s/secret.yml
```

Configuration :

```bash
kubectl apply -f k8s/configmap.yml
```

PostgreSQL :

```bash
kubectl apply \
-f k8s/postgres-pvc.yml
```

```bash
kubectl apply \
-f k8s/postgres-init.yml
```

```bash
kubectl apply \
-f k8s/postgres-deployment.yml
```

```bash
kubectl apply \
-f k8s/postgres-service.yml
```

API :

```bash
kubectl apply \
-f k8s/api-deployment.yml
```

```bash
kubectl apply \
-f k8s/api-service.yml
```

Monitoring :

```bash
kubectl apply \
-f k8s/prometheus-configmap.yml
```

```bash
kubectl apply \
-f k8s/prometheus-deployment.yml
```

```bash
kubectl apply \
-f k8s/prometheus-service.yml
```

```bash
kubectl apply \
-f k8s/grafana-configmap.yml
```

```bash
kubectl apply \
-f k8s/grafana-deployment.yml
```

```bash
kubectl apply \
-f k8s/grafana-service.yml
```

---

# 11. Vérification du cluster

Voir toutes les ressources :

```bash
kubectl get all -n todo
```

Résultat attendu :

```
pod/postgres        Running

pod/todo-api        Running

pod/prometheus      Running

pod/grafana         Running
```

---

# 12. Accès aux applications

## Todo API

Port forwarding :

```bash
kubectl port-forward \
-n todo \
service/todo-api \
3000:3000
```

Accès :

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

Accès :

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

Accès :

```
http://localhost:3001
```

---

# 13. Mise à jour d'une application

Lors d'un nouveau déploiement :

Changer l'image :

```bash
kubectl set image deployment/todo-api \
todo-api=sanedoma/todo-api:<nouvelle-version> \
-n todo
```

Suivre le déploiement :

```bash
kubectl rollout status \
deployment/todo-api \
-n todo
```

---

# 14. Gestion des pods

Voir les pods :

```bash
kubectl get pods -n todo
```

Voir les détails :

```bash
kubectl describe pod <pod> -n todo
```

Voir les logs :

```bash
kubectl logs <pod> -n todo
```

---

# 15. Redémarrage des services

API :

```bash
kubectl rollout restart \
deployment/todo-api \
-n todo
```

PostgreSQL :

```bash
kubectl rollout restart \
deployment/postgres \
-n todo
```

Grafana :

```bash
kubectl rollout restart \
deployment/grafana \
-n todo
```

---

# 16. Suppression du déploiement

Supprimer toutes les ressources :

```bash
kubectl delete namespace todo
```

Supprimer le cluster :

```bash
k3d cluster delete todo-cluster
```

---

# 17. Problèmes rencontrés

## Pod bloqué en ContainerCreating

Cause possible :

* téléchargement image Docker long
* problème réseau

Diagnostic :

```bash
kubectl describe pod <pod> -n todo
```

---

## Image Docker non trouvée dans k3d

Solution :

Importer l'image :

```bash
k3d image import \
image:tag \
-c todo-cluster
```

---

## Service inaccessible

Vérifier :

```bash
kubectl get svc -n todo
```

Puis :

```bash
kubectl describe svc <service> -n todo
```

---

# 18. Améliorations possibles

Évolutions possibles :

* ajouter un Ingress Controller
* ajouter HTTPS avec cert-manager
* utiliser Helm
* utiliser Kubernetes Secrets chiffrés
* ajouter des probes Kubernetes :

  * livenessProbe
  * readinessProbe
* ajouter Horizontal Pod Autoscaler

---

# Conclusion

Le projet utilise Kubernetes pour fournir une infrastructure complète :

```
                Kubernetes

                    |
        +-----------+-----------+

        |           |           |

      API       PostgreSQL   Monitoring

        |           |           |

   Deployment   PVC      Prometheus/Grafana

                    |

                 CI/CD

```

L'application est donc déployée sur une architecture conteneurisée, supervisée et automatisée.

