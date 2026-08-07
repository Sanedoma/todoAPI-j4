
# Monitoring avec Prometheus et Grafana

## 1. Présentation

Le projet Todo API intègre une solution de monitoring basée sur :

- **Prometheus** : collecte et stockage des métriques
- **Grafana** : visualisation des métriques sous forme de dashboards

L'objectif est de superviser l'état de l'API, mesurer son activité et observer ses performances.


Architecture :



```
          +----------------+
          |    Grafana     |
          |  Dashboard UI  |
          +--------+-------+
                   |
                   |
                   v
          +----------------+
          |  Prometheus    |
          | Metrics Store  |
          +--------+-------+
                   |
                   |
                   v
          +----------------+
          |   Todo API     |
          |   /metrics     |
          +----------------+
```

```


---

# 2. Système de métriques API

Les métriques sont générées directement par l'application Node.js.


Le middleware utilisé est :

```

src/middleware/metrics.js

```


Il permet de mesurer :

- le nombre total de requêtes HTTP
- la durée des requêtes
- les routes appelées


Les métriques sont exposées via :

```

GET /metrics

````


Exemple :

```bash
curl http://localhost:3000/metrics
````

Retour :

```
# HELP http_requests_total Total HTTP requests
# TYPE http_requests_total counter

http_requests_total{
method="GET",
route="/api/tasks",
status="200"
} 12
```

---

# 3. Middleware de métriques

Dans :

```
src/app.js
```

Le middleware est chargé avec :

```javascript
const { metricsMiddleware, metrics } =
require("./middleware/metrics");


app.use(metricsMiddleware);


app.get("/metrics", metrics);
```

Chaque requête traversant l'API est enregistrée.

---

# 4. Déploiement Prometheus Kubernetes

## 4.1 Configuration

Le fichier :

```
k8s/prometheus-configmap.yml
```

contient la configuration de scraping.

Configuration utilisée :

```yaml
global:
  scrape_interval: 15s


scrape_configs:

  - job_name: "todo-api"

    metrics_path: "/metrics"

    static_configs:

      - targets:

          - "todo-api:3000"
```

Explication :

| Paramètre       | Rôle                      |
| --------------- | ------------------------- |
| scrape_interval | fréquence de récupération |
| job_name        | nom de la cible           |
| metrics_path    | endpoint exposé           |
| target          | service Kubernetes API    |

---

# 5. Déploiement Prometheus

Déploiement :

```bash
kubectl apply -f k8s/prometheus-configmap.yml
```

```bash
kubectl apply -f k8s/prometheus-deployment.yml
```

```bash
kubectl apply -f k8s/prometheus-service.yml
```

Vérification :

```bash
kubectl get pods -n todo
```

Résultat attendu :

```
prometheus-xxxx   1/1 Running
```

---

# 6. Accès à Prometheus

Le service Kubernetes est interne :

```
ClusterIP
```

Accès local :

```bash
kubectl port-forward \
-n todo \
service/prometheus \
9090:9090
```

Interface :

```
http://localhost:9090
```

---

# 7. Vérification du scraping

Dans Prometheus :

Menu :

```
Status
    ↓
Targets
```

La cible doit apparaître :

```
todo-api

State: UP
```

Si le statut est :

```
DOWN
```

Vérifications :

```bash
kubectl get svc -n todo
```

Puis :

```bash
kubectl logs deployment/prometheus -n todo
```

---

# 8. Déploiement Grafana

Grafana permet d'exploiter les données Prometheus.

Fichiers Kubernetes :

```
k8s/grafana-configmap.yml
k8s/grafana-deployment.yml
k8s/grafana-service.yml
```

---

# 9. Configuration datasource Grafana

Le datasource est créé automatiquement grâce au ConfigMap.

Fichier :

```
k8s/grafana-configmap.yml
```

Configuration :

```yaml
datasources:

  - name: Prometheus

    type: prometheus

    access: proxy

    url: http://prometheus:9090

    isDefault: true
```

Cela évite une configuration manuelle après chaque déploiement.

---

# 10. Déploiement Grafana

Commandes :

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

Vérification :

```bash
kubectl get pods -n todo
```

Résultat :

```
grafana-xxxx   1/1 Running
```

---

# 11. Accès Grafana

Port forwarding :

```bash
kubectl port-forward \
-n todo \
service/grafana \
3001:3000
```

Interface :

```
http://localhost:3001
```

Identifiants initiaux :

```
Utilisateur :
admin

Mot de passe :
admin
```

---

# 12. Dashboard Grafana

Le dashboard exporté est stocké dans :

```
k8s/dashboard-1786115529124.json
```

Il contient plusieurs panneaux.

---

## 12.1 Nombre de requêtes

Métrique utilisée :

```
http_requests_total
```

Permet de visualiser :

* trafic API
* nombre d'appels
* évolution dans le temps

---

## 12.2 Requêtes par route

Requête Prometheus :

```promql
sum by(route)
(http_requests_total)
```

Permet d'identifier :

* routes les plus utilisées
* endpoints sollicités

---

## 12.3 Temps moyen des requêtes

Expression PromQL :

```promql
rate(http_request_duration_seconds_sum[5m])
/
rate(http_request_duration_seconds_count[5m])
```

Permet de mesurer :

* latence moyenne
* évolution des performances

---

## 12.4 Utilisation CPU

Métrique :

```
process_cpu_seconds_total
```

Permet d'observer :

* consommation CPU
* charge de l'application

---

# 13. Tests du monitoring

## Générer du trafic

Effectuer plusieurs appels :

```bash
curl http://localhost:3000/api/tasks
```

Créer une tâche :

```bash
curl \
-X POST \
-H "Content-Type: application/json" \
-d "{\"title\":\"test monitoring\"}" \
http://localhost:3000/api/tasks
```

---

## Vérifier les métriques

Accès :

```
http://localhost:3000/metrics
```

Les compteurs doivent augmenter.

---

## Vérifier Grafana

Après quelques requêtes :

1. Ouvrir Grafana
2. Aller dans Dashboard
3. Vérifier :

* augmentation du nombre de requêtes
* routes visibles
* temps de réponse

---

# 14. Commandes utiles

## Voir les logs Prometheus

```bash
kubectl logs \
-n todo \
deployment/prometheus
```

## Voir les logs Grafana

```bash
kubectl logs \
-n todo \
deployment/grafana
```

## Redémarrer Prometheus

```bash
kubectl rollout restart \
deployment/prometheus \
-n todo
```

## Redémarrer Grafana

```bash
kubectl rollout restart \
deployment/grafana \
-n todo
```

---

# 15. Limites actuelles

Le monitoring actuel permet :

✅ suivi des requêtes HTTP
✅ suivi des performances API
✅ visualisation Grafana
✅ datasource automatique

Améliorations possibles :

* ajouter Node Exporter
* ajouter métriques PostgreSQL
* ajouter AlertManager
* créer des alertes Slack/mail
* ajouter un stockage Prometheus persistant

---

# Conclusion

Le projet dispose d'une chaîne complète de supervision :

```
Application Node.js
        |
        |
      /metrics
        |
        |
   Prometheus
        |
        |
    Grafana
```

Cette architecture permet de suivre l'état de l'application et constitue une base pour une infrastructure DevOps professionnelle.
