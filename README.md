# EngiLife Backend

Production-ready backend for the EngiLife ecosystem.

## Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment**
   Create a `.env` file in `backend/`:
   ```env
   DATABASE_URL="postgresql://engilife:password@localhost:5432/engilife_db"
   JWT_SECRET="dev_secret_key"
   PORT=3001
   ```

3. **Database (Docker)**
   Start the database:
   ```bash
   docker-compose up -d postgres
   ```

4. **Run Migrations**
   ```bash
   cd backend
   npx prisma db push
   ```

5. **Start Server**
   ```bash
   npm run dev
   ```

## API Documentation

- **Auth**:
  - `POST /api/auth/signup`: Create account
  - `POST /api/auth/login`: Get JWT token
  - `POST /api/auth/verify-email`: Verify account (code: 1234)
- **Resources** (Requires `Authorization: Bearer <token>`):
  - `GET /api/tasks`, `POST /api/tasks`, etc.
  - Resources: `tasks`, `subjects`, `schedule`, `notes`, `habits`, `savingsGoals`

## Production Deployment

Use the provided `Dockerfile` and `docker-compose.yml`.
Ensure `DATABASE_URL` points to your production RDS/Postgres instance.
