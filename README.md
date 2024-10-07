![Build&Deploy#Docker](https://github.com/ValentinGuevara/skills-showcase/actions/workflows/docker-publish.yml/badge.svg?branch=main)

# 🕹️ Game & Leaderboard Microservices Demo

Welcome to the **Game & Leaderboard Microservices Demo**! This project showcases a scalable microservices architecture using **Node.js 20.0**. The two services—**Game** and **Leaderboard**—leverage various tools and technologies for asynchronous communication, caching, and persistent storage. This README will guide you through the architecture, setup, and deployment.

## 📖 Table of Contents

- [Overview](#overview)
- [Technologies Used](#technologies-used)
- [Microservices](#microservices)
  - [Game Service](#game-service)
  - [Leaderboard Service](#leaderboard-service)
- [Setup](#setup)
  - [Prerequisites](#prerequisites)
- [Testing](#testing)
- [CI/CD Pipeline](#cicd-pipeline)
- [License](#license)

## 🎮 Overview

This repository consists of two primary services:

1. **Game Service** - An API REST service that manages game sessions. It is connected to Redis for caching game data and communicates with an OpenAI Assistant API and RabbitMQ.
2. **Leaderboard Service** - An Apollo GraphQL service that receives messages from RabbitMQ to update game results in a PostgreSQL database.

Both services are containerized with Docker and designed to run on Kubernetes (K8s) with infrastructure provisioned via Terraform on Google Kubernetes Engine (GKE).

## 🛠 Technologies Used

- **Node.js 20.0**: JavaScript runtime for building scalable server-side applications
- **Redis-om**: In-memory data store for caching game sessions
- **RabbitMQ**: Message broker for asynchronous communication
- **PostgreSQL 14.0**: Relational database for leaderboard storage
- **Sequelize ORM**: Object-Relational Mapper for PostgreSQL
- **Mocha & Supertest**: Testing frameworks for API testing
- **Docker**: Containerization of services
- **Kubernetes (K8s)**: Orchestrating microservices
- **Terraform**: Infrastructure as Code for provisioning GKE
- **GitHub Actions**: CI/CD pipeline for automated testing and deployment

## 🖥 Microservices

### Game Service

- **Endpoints**:
  - `POST /startNewGame`: Initiates a new game session, storing game data in Redis.
  - `POST /suggestSolution`: Checks the player’s solution, validates game rules (game time, attempts, etc.), and fetches hints from the OpenAI Assistant API if needed. If the solution is correct, sends a success message to RabbitMQ and removes the session from Redis.
- **Dependencies**:
  - **Redis**: Caches the current game state for each user.
  - **OpenAI API**: Provides hints when the player’s suggestion isn’t correct.
  - **RabbitMQ**: Publishes success messages for the leaderboard update.

### Leaderboard Service

- **Technology**: Apollo GraphQL server
- **Functionality**: Listens for RabbitMQ messages from the Game Service. Upon receiving a success message, updates the leaderboard in a PostgreSQL database using Sequelize ORM.
- **GraphQL API**: Exposes an endpoint for querying leaderboard data.

## 🔧 Setup

### Prerequisites

- [Node.js 20.0](https://nodejs.org/) installed
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) installed
- [Terraform](https://www.terraform.io/) installed
- Access to Google Cloud Platform for GKE

## 🧪 Testing

The Game Service includes unit and integration tests with Mocha and Supertest. Tests are located under game-service/tests.

## 📦 CI/CD Pipeline

The project includes a GitHub Actions workflow for continuous integration and deployment:

- **Unit Testing**: Automatically runs tests on each pull request.
- **Docker Build & Push**: Builds Docker images and pushes them to a container registry.
- **Kubernetes Deployment**: Deploys to GKE when changes are merged to the main branch.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
