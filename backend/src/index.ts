import 'dotenv/config';
import cors from 'cors';
import express, { type Application } from 'express';
import { sql } from 'drizzle-orm';
import swaggerUi from 'swagger-ui-express';
import { getDb } from './db/index.ts';
import { authRouter } from './routes/authRouter.ts';
import { stallRouter } from './routes/stallRouter.ts';
import { notFoundHandler } from './middlewares/notFound.ts';
import { errorHandler } from './middlewares/errorHandler.ts';
import { openApiDocument } from './docs/openapi.ts';

const app: Application = express();
const PORT: number = Number(process.env.PORT ?? 3000);

// Tugas 4: frontend React berjalan di origin lain (mis. http://localhost:5173),
// jadi browser hanya mengizinkan request jika backend memberi izin lewat CORS.
// Daftar origin diatur di .env (CORS_ORIGIN, pisahkan dengan koma).
const allowedOrigins: string[] = (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);

app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use(express.json());

app.get('/docs/swagger.json', (_req, res) => {
  res.status(200).json(openApiDocument);
});
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.get('/health', async (_req, res) => {
  const db = await getDb();
  await db.execute(sql`SELECT 1 AS ok`);
  res.status(200).json({ status: 'success', message: 'Server dan database terhubung' });
});

// Dipasang di /api/v1/... (sesuai hands-on) dan di root /... (sesuai tabel soal Tugas 3)
app.use('/api/v1/auth', authRouter);
app.use('/auth', authRouter);

app.use('/api/v1/stalls', stallRouter);
app.use('/stalls', stallRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
