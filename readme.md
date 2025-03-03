# CI/CD Pipeline

Deploy a CI/CD pipeline into your home lab

All files are available here - https://github.com/arbaaz29/pipeline/tree/main 

## Docker:

For installation, follow the steps from the official website:

https://docs.docker.com/engine/install/

1. Containerize the applications
    
    ```yaml
    # go to respective directory and build images
    # command
    docker build -t arbaazij/back_jnks App-files/backend/.
    docker build -t arbaazij/front_jnks App-files/frontend/.
    ```
    
    <image src="/images/image.png" width="900"/>
    
2. Test using docker-compose
    
    ```yaml
    # got to App-files there is a docker-compose manifest
    docker compose up # if you are using it freshly
    
    docker compose build --no-cahce # build from scratch
    docker compose up #will use the newly built images
    ```
    
3. Push the built images to docker repo
    
    ```yaml
    # you need to login to docker via terminal to push it to your repository
    docker login
    
    docker push arbaazij/back_jnks
    docker push arbaazij/front_jnks
    
    docker push {your docker username}/{name you want to gave to your image}
    ```
    

## Kubernetes (Minikube):

 https://minikube.sigs.k8s.io/docs/start/?arch=%2Fwindows%2Fx86-64%2Fstable%2F.exe+download

1. Start minikube ( ubuntu ):
    
    ```bash
    # ubuntu
    minikube start --memory=8192 # starting minikube with 2 Cpu cores and 8 GB of memory (RAM)
    # mac
    minikube start --driver=hyperkit
    # windows
    minikube start --driver=hyperv
    
    ```
    
2. Install add-ons:
    
    ```bash
    minikube addons enable ingress
    minikube addons enable metrics-server
    ```
    

## Jenkins:

1. Install Jenkins: https://www.jenkins.io/doc/book/installing/linux/
2. Add Jenkins to the Docker group:
    
    ```bash
    usermod -aG Jenkins docker
    ```
    
3. Install plugins (Manage Jenkins → Plugins):
    
    ```bash
    jdk
    nodejs
    docker pipeline
    docker
    sonarqube quality gates
    OWASP dependency check
    SonarQube Scanner
    ```
    
4. Restart the Jenkins service:
    
    ```bash
    http://localhost:8080/restart
    ```
    
5. Go to Manage Jenkins→ System and configure SonarQube installations 
    1. Keep a note of the **Name** (needs to be similar to scm)
    
    <image src="/images/image%201.png" width="900"/>
    
    <image src="/images/image%202.png" width="900"/>
    
6. Go to Manage Jenkins → Tools configure jdk, SonarQube Scanner installations, NodeJS Installations, and Docker Installations
    1. Keep a note of the **Name** (needs to be similar to scm)
    
    <image src="/images/image%203.png" width="900"/>
    
    <image src="/images/image%204.png" width="900"/>
    
    <image src="/images/image%205.png" width="900"/>
    
    <image src="/images/image%206.png" width="900"/>
    
7. Setup credentials:
    
    ```bash
    # save as username and passwords
    # add git token as a secret text as well
    git token # (username and token) # repo read and write
    
    # save as secret text
    sonarqube token # global 
    
    # save as username and passwords
    docker token # (username and token)
    
    # all the tokens should be added to global groups as you will be using it in frontend and backend pipelines 
    ```
    
    <image src="/images/image%207.png" width="900"/>
    
8. Create a project:
    
    ```bash
    # create a project give it a name and select cateogry pipeline
    # Use gitscm polling 
    # Pipeline Script from SCM
        ## select git for scm
    # Paste your git repository's link 
    # select github username and password
    # specify branch path specify the path for jenkinsfile (case sensitive)
    ```
    
9. Deploying a pipeline:
    
    ```bash
    # Comment out everything and try building one stage at a time for debugging purpose
    # BUILD_ID is a in-built function in jenkins
    ```
    
10. Pipeline builds:

<image src="/images/image%208.png" width="900"/>

<image src="/images/image%209.png" width="900"/>

<image src="/images/d30298ca-7002-4300-869b-180ab7a54885.png" width="900"/>

## SonarQube:

1. This is a docker-compose file to create a sonar qube instance with persistent storage so that you don’t need to create a new api key and user for every time you restart sonarqube
    
    ```yaml
    version: "3"
    services:
      db:
        image: postgres:12-alpine
        environment:
          - POSTGRES_USER=sonar
          - POSTGRES_PASSWORD=sonar
          - POSTGRES_DB=sonar
        volumes:
          - postgres_data:/var/lib/postgresql/data
        networks:
          - bridge
    
      sonarqube:
        image: sonarqube:community
        depends_on:
          - db
        environment:
          - sonar.jdbc.username=sonar
          - sonar.jdbc.url=jdbc:postgresql://db/sonar
          - sonar.jdbc.password=sonar
        ports:
          - "9000:9000"
        volumes:
          - sonar_conf:/opt/sonarqube/conf
          - sonar_data:/opt/sonarqube/data
          - sonar_extensions:/opt/sonarqube/extensions
          - sonar_plugins:/opt/sonarqube/lib/bundled-plugins
        networks:
          - bridge
    
    networks:
      bridge:
    
    volumes:
      sonar_conf:
      sonar_data:
      sonar_extensions:
      sonar_plugins:
      postgres_data:
    ```
    

<image src="/images/image%2010.png" width="900"/>


<image src="/images/image%2011.png" width="900"/>

<image src="/images/image%2012.png" width="900"/>

### Trivy:

Install trivy:

https://trivy.dev/v0.18.3/installation/

```bash
sudo apt-get install wget apt-transport-https gnupg lsb-release
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
echo deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main | sudo tee -a /etc/apt/sources.list.d/trivy.list
sudo apt-get update
sudo apt-get install trivy
```

## OLM (Operator Lifecycle Management):

Manual Install:

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

## ArgoCD:

1. Install ArgoCD through
 https://operatorhub.io/operator/argocd-operator
2. Create a deployment file and apply it in your k8s environment:
    
    ```bash
    apiVersion: argoproj.io/v1alpha1
    kind: ArgoCD
    metadata:
      name: argocd
      labels:
        app: argocd
    spec: {}
    ```
    
    <image src="/images/image%2013.png" width="900"/>
    
    A misconfigured image had been pushed to GitHub, which resulted in the new image failing. Seeing this, the ArgoCD deployed an old working version as a failover and self-healing measure
    
    The problematic version was **back_jnks:41**
    
    <image src="/images/image%2014.png" width="900"/>
    
    This is the result after a properly configured back_jnks image was pushed to docker. ArgoCD applied the new manifests as they were healthy and working properly it killed the old container
    
    <image src="/images/image%2015.png" width="900"/>
    

## Prometheus:

1. Install prometheus using Operator:
    1. https://operatorhub.io/operator/prometheus#
2. Perform clusterrolesbinds and rolebinds:
    
    ```bash
    #rbac:
    apiVersion: rbac.authorization.k8s.io/v1
    kind: Role
    metadata:
      name: prometheus-monitoring-reader
      namespace: monitoring
    rules:
    - apiGroups: [""]
      resources: ["services", "endpoints", "pods"]
      verbs: ["get", "list", "watch"]
      ---
    apiVersion: rbac.authorization.k8s.io/v1
    kind: ClusterRole
    metadata:
      name: prometheus-reader
    rules:
    - apiGroups: [""]
      resources: ["services", "endpoints", "pods"]
      verbs: ["get", "list", "watch"]
    ```
    
    ```bash
    kubectl create -f https://operatorhub.io/install/prometheus.yaml
    
    # create cluster roles and bind them to the service account:
    kubectl create clusterrolebinding prometheus-cluster-view   --clusterrole=view   --serviceaccount=monitoring:prometheus-k8s
    kubectl create rolebinding prometheus-view-binding   --role=view   --serviceaccount=monitoring:prometheus-k8s   --namespace=default
    kubectl create rolebinding prometheus-monitoring-view   --role=view   --serviceaccount=monitoring:prometheus-k8s   --namespace=monitoring
    
    ```
    
    ```bash
    kubectl create rolebinding prometheus-monitoring-reader-binding   --role=prometheus-monitoring-reader   --serviceaccount=monitoring:prometheus-k8s   --namespace=monitoring
    kubectl create clusterrolebinding prometheus-reader-binding   --clusterrole=prometheus-reader   --serviceaccount=monitoring:prometheus-k8s
    
    ```
    
    ```bash
    # Verify if the roles are bound successfully
    kubectl auth can-i get services --as=system:serviceaccount:monitoring:prometheus-k8s -n monitoring
    ```
    
3. Apply the manifests from the Prometheus folder:
    
    ```bash
    kubectl apply -f prometheus
    ```
    
4. Verify if the deployment and service monitor has been created
    
    ```bash
    kubectl get servicemonitor -n monitoring # you should see a backend-monitor service monitor
    kubectl get po -n monitoring # you should see 2 instances of highly avaiable pods
    ```
    
5. Start port forwarding:
    
    ```bash
    kubectl port-forward -n monitoring svc/prometheus-operated 9090:9090
    # Status>targets you should be able to see your monitor and you should be able to query your custom query
    # if not check if servicemonitor is working properly, your pods are online and try to get some traffic on your sites so that your pod will register some of the metrics 
    ```
    
    <image src="/images/image%2016.png" width="900"/>
    
    <image src="/images/image%2017.png" width="900"/>
    

# Exposing Custom metrics for better visibility

### Metrics:

Metrics type:

1. Counter → always incrementing, will never decrement 
    1. e.g., number of http requests, number of users signed up (even if the user deleted his account, he did create it beforehand so it will be held as a counter metric), etc
2. gauge →it will show variations like incrementing and decrementing at the instance
    1. e.g. - configmap, CPU util, memory util
3. histogram → specific records of data. That is, buckets of specific conditions of metrics will be created, and if the metric matches the condition, it will be added to the bucket
    1. e.g, imagine the conditions are for latency, buckets of specific time duration will be created, for instance, bucket1-5ms, bucket2-10ms. Now, when the request for response meets these latency conditions, they will be added to their respective buckets
4. summary → similar to histogram

## Creating custom metrics for your application:

1. If you want to use any other metric collector except Prometheus, you can use open-telemetry (it is a generic module that helps aggregate metrics that can be interpreted by the respective implementation)
2. If using Prometheus (best for k8s):
    1. npm specific implementation:
        
        ```bash
        npm install prom-client
        ```
        
    2. Add the promclient to your code:
        
        ```jsx
        const promClient = require('prom-client');
        
        //following are the basic templates you can use for metrics
        //adding a http counter:
        const httpRequestCounter = new promClient.Counter({
            name: "http_requests_total",
            help: "Total number of http requests",
            labelNames: ['method', 'path', 'status_code'], 
        });
        
        //adding a duration histogram
        const requestDuration = new promClient.Histogram({
            name: "http_requests_duration_seconds",
            help: "duration of http requests in seconds",
            labelNames: ['method', 'path', 'status_code'],
            buckets: [0.1, 0.5, 1, 5, 10], //buckets for histograms in seconds 
        });
        
        //adding a duration summary
        const requestDurationSummary = new promClient.Summary({
            name: "http_requests_summary_seconds",
            help: "Summary of http requests in seconds",
            labelNames: ['method', 'path', 'status_code'],
            buckets: [0.5, 0.9, 0.99], //Percenties
        });
        
        // gauge metric
        const gauge = new promClient.Gauge({
            name: "node_gauge",
            help: "gauge tracking async task duration",
            labelNames: ['method', 'status_code'], 
        });
        
        ```
        
    3. These metrics are specific to my implementation, you will need to customize them according to your needs
        
        ```jsx
        //Middleware to track metrics
        app.use((req, res, next) => {
            const start = Date.now();
            res.on('finish', () => {
                const duration = (Date.now() - start) / 1000; // Duration in seconds
                const { method, url } = req;
                const statusCode = res.statusCode; // Get the actual HTTP status code
                httpRequestCounter.labels({ method, path: url, status_code: statusCode }).inc();
                requestDuration.labels({ method, path: url, status_code: statusCode }).observe(duration);
                requestDurationSummary.labels({ method, path: url, status_code: statusCode }).observe(duration);
            });
            next();
        });
        
        // to expose metrics 
        //you will need to add this api route
        app.get('/metrics', async (req, res) => {
            res.set('Content-Type', promClient.register.contentType);
            res.end(await promClient.register.metrics());
        });
        ```
        
    4. Exposing metrics using service discovery:
        
        ```yaml
        # the prometheus stack should be running in namespace montoring
        apiVersion: monitoring.coreos.com/v1
        kind: ServiceMonitor
        metadata:
          labels:
            backmon: backend-monitor
            release: monitoring
          name: backmon
          namespace: monitoring
        spec:
          jobLabel: job_back
          endpoints:
            - interval: 2s
              targetPort: 5000
              path: /metrics
          selector:
            matchLabels:
              app: back
          namespaceSelector:
            matchNames:
              - default
        ```
        

## Grafana:

1. Install grafana using operator:
    1. Create CRDs:
        
        ```bash
        kubectl create -f https://operatorhub.io/install/prometheus.yaml
        ```
        
    2. Apply manifests from the grafana folder:
        
        ```bash
        kubectl apply -f grafana
        ```
        
    3. Create a dashboard:
        
        ```bash
        rate(http_requests_total{namespace!="",pod!="",path!=""}[5m])
        ```
        
        <image src="/images/675c4beb-c387-4678-888e-102a1c33abe4.png" width="900"/>
        

# Final results:

K8s deployment:

<image src="/images/image%2018.png" width="900"/>

<image src="/images/image%2019.png" width="900"/>

Prometheus:

<image src="/images/image%2016.png" width="900"/>

<image src="/images/image%2017.png" width="900"/>

Grafana:

<image src="/images/675c4beb-c387-4678-888e-102a1c33abe4.png" width="900"/>

References:

https://faun.pub/using-the-operator-lifecycle-manager-to-deploy-prometheus-on-openshift-cd2f3abb3511

https://operatorhub.io/operator/prometheus#

https://operatorhub.io/operator/grafana-operator

