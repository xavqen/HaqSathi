# Fix: Prisma 7 `url` / `directUrl` schema error

This project currently uses the stable Prisma 6 schema style:

```prisma
datasource db {
  provider = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

The issue happens when `package.json` uses `latest` and npm installs Prisma 7.x. Prisma 7 moved connection URLs out of `schema.prisma`, so it fails with:

```text
The datasource property `url` is no longer supported in schema files.
```

## Fixed in this version

`package.json` now pins:

```json
"@prisma/client": "6.19.3",
"prisma": "6.19.3"
```

## Clean reinstall on Windows PowerShell

Run this inside the project folder:

```powershell
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
npm install
npm run prisma:version
npm run db:doctor
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Expected Prisma version:

```text
prisma                  : 6.19.3
@prisma/client          : 6.19.3
```

If `db:push` still fails with `P1000`, your Supabase database username/password in `.env` is wrong. Reset the DB password in Supabase and paste fresh `DATABASE_URL` and `DIRECT_URL`.
