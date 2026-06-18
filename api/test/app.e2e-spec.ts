import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma/prisma.service';

interface AuthBody {
  accessToken: string;
  user: { id: string; name: string; email: string };
}

interface TaskBody {
  id: string;
  title: string;
  description: string | null;
  status: string;
  userId: string;
}

/**
 * End-to-end flow: register -> login -> tasks CRUD -> profile.
 *
 * Requires DATABASE_URL pointing to a (preferably dedicated) test database
 * with the migrations already applied:
 *   DATABASE_URL="postgresql://..." npx prisma migrate deploy
 *   DATABASE_URL="postgresql://..." yarn test:e2e
 */
describe('Todo List API (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let accessToken: string;
  let taskId: string;

  const user = {
    name: 'E2E User',
    email: 'e2e.user@email.com',
    password: 'P@ssw0rd',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );

    prisma = app.get(PrismaService);
    await prisma.task.deleteMany();
    await prisma.user.deleteMany();

    await app.init();
  });

  afterAll(async () => {
    await prisma.task.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  describe('Users / Auth', () => {
    it('POST /users -> creates a user (201) without leaking password', async () => {
      const res = await request(app.getHttpServer())
        .post('/users')
        .send(user)
        .expect(201);

      expect(res.body).toMatchObject({ name: user.name, email: user.email });
      expect(res.body).not.toHaveProperty('password');
    });

    it('POST /users -> 409 when email already exists', async () => {
      await request(app.getHttpServer()).post('/users').send(user).expect(409);
    });

    it('POST /users -> 400 when sending an unknown property', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({ ...user, teste: 'invalid' })
        .expect(400);
    });

    it('POST /auth/login -> 200 returns an access token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: user.email, password: user.password })
        .expect(200);

      const body = res.body as AuthBody;
      expect(body).toHaveProperty('accessToken');
      expect(body.user).toMatchObject({ email: user.email });

      accessToken = body.accessToken;
    });

    it('POST /auth/login -> 401 with wrong password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: user.email, password: 'wrong-password' })
        .expect(401);
    });

    it('GET /users/me -> returns the authenticated profile', async () => {
      const res = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toMatchObject({ email: user.email });
      expect(res.body).toHaveProperty('tasks');
    });
  });

  describe('Tasks', () => {
    it('GET /tasks -> 401 without token', async () => {
      await request(app.getHttpServer()).get('/tasks').expect(401);
    });

    it('POST /tasks -> creates a task owned by the user (201)', async () => {
      const res = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'First task', description: 'A description' })
        .expect(201);

      const body = res.body as TaskBody;
      expect(body).toMatchObject({ title: 'First task', status: 'PENDING' });
      taskId = body.id;
    });

    it('GET /tasks -> lists only the user tasks', async () => {
      const res = await request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const body = res.body as TaskBody[];
      expect(Array.isArray(body)).toBe(true);
      expect(body).toHaveLength(1);
      expect(body[0].id).toBe(taskId);
    });

    it('GET /tasks/:id -> returns the task', async () => {
      const res = await request(app.getHttpServer())
        .get(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect((res.body as TaskBody).id).toBe(taskId);
    });

    it('PATCH /tasks/:id/status -> advances PENDING to IN_PROGRESS', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/tasks/${taskId}/status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect((res.body as TaskBody).status).toBe('IN_PROGRESS');
    });

    it('PATCH /tasks/:id -> updates the task', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Updated task' })
        .expect(200);

      expect((res.body as TaskBody).title).toBe('Updated task');
    });

    it('DELETE /tasks/:id -> removes the task', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toEqual({ message: 'Task successfully deleted' });
    });

    it('GET /tasks/:id -> 404 after deletion', async () => {
      await request(app.getHttpServer())
        .get(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });
});
