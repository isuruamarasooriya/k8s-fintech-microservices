# Cloud-Native FinTech Microservices Platform 

A scalable, cloud-native FinTech microservices platform featuring automated CI/CD, GitOps deployments, and resilient cloud architecture. 

This project integrates custom-built microservices (Node.js/React) with a fully automated CI/CD pipeline, dynamic infrastructure provisioning via Terraform, and GitOps deployments using ArgoCD on Amazon EKS.

---

## 📸 System Screenshots

### 1. Live FinTech Fraud Monitor Dashboard (Served via CloudFront & ALB)
![Live Dashboard](assets/Live%20Dashboard.png)

### 2. GitOps Deployment via ArgoCD
*Notice the fully synced and healthy application state managed automatically by ArgoCD.*
![ArgoCD Dashboard](assets/ArgoCD%20Dashboard.png)

### 3. Running Kubernetes Pods
![Terminal & VS Code](assets/Kubernetes%20Pods.png)

---

## Project Architecture & Components

The application simulates a real-time FinTech environment, processing transactions and automatically detecting fraudulent activities based on specific geographic and monetary rules.

### Core Microservices
1. **Frontend (React + Vite):** A real-time dashboard hosted on Amazon S3 and distributed globally via CloudFront (OAC secured).
2. **Ingestion API (Node.js + Express):** A containerized REST API running on Kubernetes that receives incoming transactions and queues them as `PENDING` in DynamoDB.
3. **Fraud Worker (Node.js):** A background processor that continuously polls DynamoDB for `PENDING` transactions, applies risk-analysis algorithms, and updates the status (`SAFE`, `HIGH_AMOUNT_FRAUD`, or `LOCATION_FRAUD`).
4. **Traffic Simulator:** A local Node.js script that artificially generates randomized transaction data (including a 15% fraud probability) for testing and load generation.

---

## Transaction & Traffic Flow

### Production Traffic Flow
```text
      Real Users / Client Apps
                 | (HTTPS)
                 v
         Amazon CloudFront
           /           \
   (Static Assets)   (Dynamic API Requests: /api/*)
         /               \
        v                 v
    Amazon S3        AWS Application Load Balancer (ALB)
                          |
                          v
                  Amazon EKS Cluster
                          |
                          v
                 Ingestion API (Pods)
                          |
                          v
                   Amazon DynamoDB <---- Fraud Worker (Polling)
```


### Automated Fraud Detection Logic
The Fraud Worker evaluates each transaction against the following parameters:
* **HIGH_AMOUNT_FRAUD:** Transaction amount exceeds Rs. 500,000.
* **LOCATION_FRAUD:** Transaction originates outside of Sri Lanka (LK) AND the amount exceeds Rs. 100,000.
* **SAFE:** All other valid transactions.

---

## Technology Stack

### Infrastructure as Code (IaC) & Cloud Services
* **Terraform:** Infrastructure provisioning (VPC, EKS, ALB, S3, CloudFront).
* **Amazon EKS:** Managed Kubernetes cluster (ap-south-1).
* **AWS ALB & CloudFront:** Traffic routing, caching, and secure CDN.
* **Amazon DynamoDB:** Fully managed NoSQL database for transaction records.
* **Amazon ECR:** Private container registry for Docker images.

### Containerization & Orchestration
* **Docker:** Microservices containerization.
* **Kubernetes:** Deployments, ClusterIP Services, and Ingress routing.
* **Horizontal Pod Autoscaler (HPA):** Dynamically scales the ingestion-api from 2 to 6 replicas when CPU utilization exceeds 70%.
* **Helm:** Package manager used for deploying ArgoCD and AWS Load Balancer Controller.

### CI/CD & GitOps
* **GitHub Actions:** Continuous Integration, testing, building, and ECR pushing.
* **ArgoCD:** Continuous Deployment (GitOps) automatically syncing the k8s/ manifests to the EKS cluster with selfHeal and auto-prune enabled.

### Application Code
* **Node.js & Express:** Backend API and background worker.
* **React & Vite:** Frontend dashboard.

---

## CI/CD Pipeline Workflow
This project utilizes a fully automated pipeline triggered by pushes to the main branch:
1. **Unit Testing:** Runs npm test on the Ingestion API.
2. **Build & Push:** Dockerizes the ingestion-api and fraud-worker, tagging them with the unique GitHub SHA, and pushes them to Amazon ECR.
3. **Manifest Update:** Uses sed to dynamically update the image tags in k8s/ingestion-api-deployment.yaml and k8s/fraud-worker-deployment.yaml.
4. **GitOps Trigger:** Commits the updated YAML files back to the repository by a GitHub Actions bot.
5. **ArgoCD Sync:** ArgoCD detects the changes in the Git repository and seamlessly rolls out the new application versions to the EKS cluster.
6. **Frontend Deployment:** Builds the Vite application, syncs the static files to the S3 bucket, and triggers a CloudFront cache invalidation.

---

# Local Testing & Traffic Simulation

To test the live fraud-detection workflow, auto-scaling, and dashboard in real time, you can run the local traffic generator:

1. **Port-forward the Ingestion API service** (if accessing the cluster locally):
   ```bash
   kubectl port-forward svc/ingestion-api-service 5001:80

---

## Key Features Demonstrated
* **Infrastructure as Code (IaC):** 100% automated AWS provisioning using Terraform.
* **GitOps Methodology:** Single source of truth deployment using ArgoCD.
* **Auto-Scaling:** Kubernetes HPA ensures the API scales under heavy simulated traffic.
* **Secure Architecture:** S3 buckets are protected using CloudFront Origin Access Control (OAC). Amazon CloudFront provides default SSL/TLS encryption for end-users, while the ALB handles internet-facing API routing.
* **Zero-Downtime Deployments:** Seamless updates handled via Kubernetes Deployment rolling updates.

