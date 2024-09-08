# Hello-World UI Service: Retrieve Data from MongoDB Using Node.js

## Project Description

### Overview
The Hello World UI service project is designed to deploy a Node.js web application using an Amazon EKS Cluster. The project utilizes Docker for containerization and Amazon Elastic Container Registry (ECR) for storing Docker images. It integrates with Kubernetes for application deployment.

### Goals
- **Deploy Node.js Application**: Containerize and deploy a Node.js web application to an EKS cluster.
- **Manage Docker Images**: Use an ECR repository to store and manage Docker images.
- **Create MongoDB Instance in EKS**: Set up a MongoDB replica set in the EKS Cluster.
- **Access Data from MongoDB**: Retrieve data from MongoDB and display it in the Node.js application.
- **Access Node.js Application from Load Balancer**: Access the Node.js application through the Load Balancer endpoint.
- **GitOps Workflow for Node.js application**: Setup GitOps workflow to build, tag and publish container images to ECR repository for node.js application

## Architecture Diagram

![Architecture Diagram](https://github.com/user-attachments/assets/54abbe2b-dd42-4a6e-b5b0-106f9bdcd81b)

## Setup Instructions

### 1. Clone the Repository

Clone the repository to your local machine:
```bash
git clone https://github.com/thunderbirdgit/hw-nodejs.git
```
   
### 2. GitOps Workflow
1. Create a feature branch and make the required changes to the application repository.
   
2. Store AWS Credentials such as Access key, Region, Account ID and Secret keys in secrets and variables in Github repository settings
   
   <img width="1224" alt="image" src="https://github.com/user-attachments/assets/cdbb9b89-3a60-4ba5-916f-c2217ad8a764">

3. GitHub Actions will be executed as part of the pre-commit check workflow.

   <img width="864" alt="image" src="https://github.com/user-attachments/assets/112af547-0e42-452e-8774-e8e26f9fbcf3">

4. Once the PR checks are green, the user will be allowed to merge the pull request. Merging will be blocked unless the checks are green.
   
5. Once the changes are merged, the GitOps workflow will clone, build, tag, and publish the Docker image to the ECR repository.

   <img width="535" alt="image" src="https://github.com/user-attachments/assets/d609c673-8304-4f7e-b5d5-eb04cf8d2bc8">
  
6. You can verify that the Docker image is pushed to the ECR repository.

   <img width="1091" alt="image" src="https://github.com/user-attachments/assets/114fefd8-05e3-4660-9c98-ed38d15aa7df">

### 3. Kubernetes Manifests:

1. The manifests/ folder in the repository contains the following deployment files to deploy the Node.js application, create Kubernetes services and Ingress layers, and create MongoDB instances.

2. Node.js Application Setup:
  - deployment.yml: Creates the hw-nodejs DeploymentSet with the number of replicas, pulls the image from the Docker container, and exposes port 3000 for service access.
  - service.yml: Creates a Kubernetes service layer to access the application on port 3000.
  - ingress.yml: Sets up an Ingress layer using NGINX as the reverse proxy, allowing the Node.js application to be accessed through dev.helloworld.com. NGINX acts as a load balancer to route application traffic through the ALB.

3. MongoDB Setup:
  - mongodb.yml: Creates a MongoDB cluster as a StatefulSet, specifying the number of replicas, required mountPath, and volumeMounts.
  - mongodb-service.yml: Creates a MongoDB Kubernetes service layer.
  - mongodb-loadbalancer.yml: Creates a dev-mongodb-lb load balancer layer.

### 4. Mongo DB Data setup:

1. Create the helloworld database in MongoDB.
2. Create the messages collection.
3. Insert "Hello World!!" data into the messages collection:
   ```
   mongosh "mongodb://<mongodb_hostname>:27017"
   > use helloworld;
   > db.messages.insertOne({ message: "Hello World !!" });
   > db.messages.find().pretty();
   ```
   <img width="728" alt="image" src="https://github.com/user-attachments/assets/608ab1c8-f584-4719-8bbd-4e1fe158b374">

### 5. Deploy NGINX controller:

Deploy the NGINX Kubernetes controller:
    
 ```
 $ helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
 $ helm upgrade -i ingress-nginx ingress-nginx/ingress-nginx --version 4.2.3 --namespace kube-system --set controller.service.type=ClusterIP
 
 $ kubectl -n kube-system rollout status deployment ingress-nginx-controller
 deployment "ingress-nginx-controller" successfully rolled out

 $ kubectl get deployment -n kube-system ingress-nginx-controller
 NAME                       READY   UP-TO-DATE   AVAILABLE   AGE
 ingress-nginx-controller   1/1     1            1           44h

 $ kubectl get pods -n kube-system | grep nginx
 ingress-nginx-controller-7f49ccf564-mnfmk   1/1     Running   0          44h
 ```

### 6. Apply Kubernetes changes

Apply the Kubernetes changes:
 ```
 cd hw-nodejs/manifests
 kubectl apply -f .
 ```

### 7. Access the Application

In a real-world scenario, dev.helloworld.com will be registered through domain registration providers. For the purposes of this exercise, modify the /etc/hosts file on your laptop or other device to access http://dev.helloworld.com through the Ingress IP.

<img width="525" alt="image" src="https://github.com/user-attachments/assets/c1f3d837-d681-4e9d-8b7f-693845666ff6">

<img width="451" alt="image" src="https://github.com/user-attachments/assets/839ba8e1-b7f4-4c3b-8481-19087b602bf1">

### 8. Monitor Ingress Logs

Ingress access logs can be accessed by running: `kubectl logs <nginx_controller_pod> -n kube-system`    
<img width="1418" alt="image" src="https://github.com/user-attachments/assets/9adacaf6-dc56-4122-82b2-2b804754931a">

### 9. Cleanup

To clean up resources, run:

```
kubectl delete deployment hw-nodejs;
kubectl delete service hw-nodejs;
kubectl delete ingress hw-nodejs
```

