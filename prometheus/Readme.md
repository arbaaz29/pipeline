# Install OLM manually:
### Note -> change the version number according to latest release

```bash
kubectl create -f https://github.com/operator-framework/operator-lifecycle-manager/releases/download/v0.31.0/crds.yaml
kubectl wait --for=Established -f https://github.com/operator-framework/operator-lifecycle-manager/releases/download/v0.31.0/crds.yaml
kubectl create -f https://github.com/operator-framework/operator-lifecycle-manager/releases/download/v0.31.0/olm.yaml
kubectl rollout status -w deployment/olm-operator --namespace=olm
retries=30
until [[ $retries == 0 ]]; do
    new_csv_phase=$(kubectl get csv -n olm packageserver -o jsonpath='{.status.phase}' 2>/dev/null || echo "Waiting for CSV to appear")
    if [[ $new_csv_phase != "$csv_phase" ]]; then
        csv_phase=$new_csv_phase
        echo "Package server phase: $csv_phase"
    fi
    if [[ "$new_csv_phase" == "Succeeded" ]]; then
        break
    fi
    sleep 10
    retries=$((retries - 1))
done

if [ $retries == 0 ]; then
    echo "CSV \"packageserver\" failed to reach phase succeeded"
    exit 1
fi
```

## Install CRDs for Prometheus:
https://operatorhub.io/operator/prometheus#
```bash
kubectl create -f https://operatorhub.io/install/prometheus.yaml
```

### Create monitoring namespace:
```bash
    kubectl create ns monitoring
```
### Deploy roles:
```bash
    kubectl apply -f rbac -n monitoring
```

### Deploy the sevicemonitor manifest:
```bash
    kubectl -f servicemonitor.yaml -n monitoring
    # verify if it has been created
    kubectl get servicemonitor -n monitoring
```

### Deploy Prometheus deployment:
```bash
    kubectl -f deployments.yaml -n monitoring
    # verify if it has been created
    kubectl get po -n monitoring # takes few seconds to create
```

### Verify:
```bash
    #once the pods start running check their logs if you are facing connection issues create the following roles and clusteroles and bind it to the service account:
    kubectl create clusterrolebinding prometheus-cluster-view   --clusterrole=view   --serviceaccount=monitoring:prometheus-k8s # view role binds the whole cluster
    kubectl create rolebinding prometheus-view-binding   --role=view   --serviceaccount=monitoring:prometheus-k8s   --namespace=default # view role binds for namespace default
    kubectl create rolebinding prometheus-monitoring-view   --role=view   --serviceaccount=monitoring:prometheus-k8s   --namespace=monitoring # view role binds for namespace monitoring

    kubectl create rolebinding prometheus-monitoring-reader-binding   --role=prometheus-monitoring-reader   --serviceaccount=monitoring:prometheus-k8s   --namespace=monitoring
    kubectl create clusterrolebinding prometheus-reader-binding   --clusterrole=prometheus-reader   --serviceaccount=monitoring:prometheus-k8s

    # Verify if the roles are bound successfully
    kubectl auth can-i get services --as=system:serviceaccount:monitoring:prometheus-k8s -n monitoring

    # restart the deployment
    kubectl delete -f deployments.yaml -n monitoring

    # Expose the service
    kubectl get svc -n monitoring

    kubectl port-forward svc/prometheus-operated 9090 -n monitoring 

    # if port 9090 is busy
     kubectl port-forward svc/prometheus-operated 8080:9090 -n monitoring # change 8080 as per ur preference

     # Open prometheus dashboard and check targets you should be able to see your your monitor in the targets section 
     # if not check if servicemonitor is working properly, your pods are online and try to get some traffic on your sites so that your pod will register some of the metrics
     
```
