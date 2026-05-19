# Next.js 14.2, Python, Docker: Build a fullstack rest API in TypeScript and Python, using Flask

A complete modern full-stack application featuring a Next.js frontend built with TypeScript and Tailwind CSS, communicating with a Flask (Python) REST API backend. The entire ecosystem is containerized and managed seamlessly using Docker Compose and a persistent PostgreSQL database engine.

## 🚀 Features
* **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS
* **Backend:** Python / Flask RESTful API
* **Database:** Persistent PostgreSQL relational database storage
* **DevOps:** Multi-container orchestration via Docker Compose

## 🛠️ Tech Stack & Port Layout
* **Frontend UI Dashboard:** Port `3000`
* **Flask API Server Layer:** Port `4000`
* **PostgreSQL Database Engine:** Port `5432`

## 📦 Getting Started

### Prerequisites
Make sure you have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed on your machine.

### Running the App via Docker Containers
1. Clone this repository to your local directory.
2. Spin up and build the entire multi-container backend network architecture using Docker Compose:
   ```bash
   docker compose up -d
