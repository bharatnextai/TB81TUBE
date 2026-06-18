# TB81TUBE Database Setup

TB81TUBE uses PostgreSQL with Prisma ORM. Do not switch the project to SQLite for the MVP; use one of the PostgreSQL options below.

## Required DATABASE_URL

For the default local setup, `apps/backend/.env` should contain:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tb81tube?schema=public"
```

## Option A: Docker PostgreSQL

Use Docker when Docker Desktop can reach Docker Hub.

```powershell
docker compose up -d postgres
npm.cmd run db:generate -w @tb81tube/backend
npm.cmd run db:migrate -w @tb81tube/backend
npm.cmd run db:check -w @tb81tube/backend
```

Useful commands:

```powershell
npm.cmd run db:up
npm.cmd run db:logs
npm.cmd run db:down
```

## Option B: Windows Local PostgreSQL

Use this if Docker cannot pull images.

1. Install PostgreSQL locally on Windows.
2. Use username `postgres`.
3. Use password `postgres`.
4. Create a database named `tb81tube`.
5. Set `DATABASE_URL` in `apps/backend/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tb81tube?schema=public"
```

6. Run Prisma:

```powershell
npm.cmd run db:generate -w @tb81tube/backend
npm.cmd run db:migrate -w @tb81tube/backend
npm.cmd run db:check -w @tb81tube/backend
```

## Option C: Cloud PostgreSQL

Use this if Docker or local PostgreSQL is blocked. Common development providers:

- Supabase
- Neon
- Railway
- Render PostgreSQL

Create a PostgreSQL database, copy the provider's PostgreSQL connection string, and paste it into `apps/backend/.env`:

```env
DATABASE_URL="your_cloud_postgresql_connection_string"
```

Then run:

```powershell
npm.cmd run db:generate -w @tb81tube/backend
npm.cmd run db:migrate -w @tb81tube/backend
npm.cmd run db:check -w @tb81tube/backend
```

## Prisma Migration Commands

Generate Prisma Client:

```powershell
npm.cmd run db:generate -w @tb81tube/backend
```

Apply migrations:

```powershell
npm.cmd run db:migrate -w @tb81tube/backend
```

Check database connection:

```powershell
npm.cmd run db:check -w @tb81tube/backend
```

Open Prisma Studio:

```powershell
npm.cmd run db:studio -w @tb81tube/backend
```

## Troubleshooting: Cannot Reach Localhost 5432

If registration or login fails with:

```text
Can't reach database server at `localhost:5432`
```

PostgreSQL is not running, the database does not exist, or `DATABASE_URL` points to the wrong host, port, username, password, or database.

Try:

```powershell
docker compose up -d postgres
npm.cmd run db:migrate -w @tb81tube/backend
npm.cmd run db:check -w @tb81tube/backend
```

If Docker is unavailable, start your local Windows PostgreSQL service or use a cloud PostgreSQL connection string.

## Troubleshooting: Docker Hub DNS Failure

If Docker fails with:

```text
lookup registry-1.docker.io: no such host
```

Docker cannot resolve or reach Docker Hub. Possible causes:

- Internet or DNS issue.
- Docker Desktop cannot access Docker Hub.
- Proxy, VPN, or firewall issue.
- Docker Desktop proxy is not configured.
- DNS is blocked by the current network.

Suggested checks:

```powershell
nslookup registry-1.docker.io
docker pull hello-world
docker pull postgres:16
```

Suggested fixes:

- Restart Docker Desktop.
- Restart your internet connection or router.
- Try a different network or mobile hotspot.
- Disable the VPN, or configure Docker Desktop proxy correctly.
- Configure Docker Desktop proxy settings if your network requires a proxy.
- Try Docker again later.
- Use local PostgreSQL or cloud PostgreSQL if Docker Hub is blocked.
