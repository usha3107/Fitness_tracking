# Fitness Tracking API

A type-safe, production-grade fitness tracking API built with Node.js, Express, TypeScript, PostgreSQL, and Prisma. This project demonstrates a three-layer validation strategy ensuring data integrity at the compile-time, runtime, and database levels.

## Features

- **Strict Type Safety**: Full TypeScript integration with `strict: true` and Zod schema inference.
- **Multi-Layer Validation**:
  - **Zod**: Runtime request validation.
  - **PostgreSQL**: Raw SQL constraints (CHECK, UNIQUE) for data integrity.
- **Polymorphic Data**: Discriminated unions for storing different exercise types (Strength vs Cardio) in a simplified relational schema.
- **Atomic Transactions**: Safe member enrollment handling race conditions.
- **Dockerized**: Complete environment setup with Docker Compose.

## Prerequisites

- Docker & Docker Compose

## Setup & Running

1.  **Start the Services**

    ```bash
    docker-compose up --build -d
    ```

2.  **Initialize Database**
    This script runs migrations, applies raw SQL constraints, and seeds the database.

    ```bash
    docker-compose run --rm app sh migrate.sh
    ```

3.  **Run Verification Tests**
    Execute the automated test suite to verify all requirements.
    ```bash
    docker-compose run --rm app npx ts-node tests/verify.ts
    ```

## API Endpoints

### Gyms

- `POST /api/gyms`: Create a new gym.
  - _Validation_: Capacity must be > 0. Name must be unique.

### Trainers

- `POST /api/trainers/:trainerId/assignments`: Assign a trainer to a gym.
  - _Logic_: Checks trainer assignment limits based on certification.

### Members

- `POST /api/members/:memberId/enrollments`: Enroll a member.
  - _Logic_: Atomic transaction ensuring gym capacity is not exceeded.

### Sessions (Polymorphic)

- `POST /api/sessions/:sessionId/exercises`: Add an exercise.
  - _Validation_: Schema depends on `type` ('strength' requires reps/sets, 'cardio' requires duration). Validated by Zod and DB CHECK constraints.

### Metrics

- `POST /api/members/:memberId/metrics`: Log a health metric.
  - _Validation_: Heart rate bounds (30-220). Weight temporal check (<5kg change in 24h).

## Project Structure

- `src/schemas`: Zod schemas (Single Source of Truth for types).
- `src/controllers`: Business logic and transaction handling.
- `prisma/schema.prisma`: Database definition.
- `constraints.sql`: Raw SQL constraints applied via migration.
- `migrate.sh`: Automation script for DB setup.
