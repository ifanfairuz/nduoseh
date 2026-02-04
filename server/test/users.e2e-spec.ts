/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/services/prisma/prisma.service';

describe('UsersController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let authToken: string;
  let testUserId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Login with seeded admin user (see prisma/seed.ts)
    // Email: admin@example.com
    // Password: Admin123
    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/password/login')
      .send({
        email: 'admin@example.com',
        password: 'Admin123',
      });

    if (loginResponse.body.access_token) {
      authToken = loginResponse.body.access_token;
    }
  });

  afterAll(async () => {
    // Cleanup test data
    if (testUserId) {
      await prisma.user.delete({
        where: { id: testUserId },
      });
    }
    await app.close();
  });

  describe('/api/users (GET)', () => {
    it('should return paginated users list with offset pagination', () => {
      return request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('pagination');
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.pagination).toHaveProperty('page');
          expect(res.body.pagination).toHaveProperty('limit');
          expect(res.body.pagination).toHaveProperty('total');
          expect(res.body.pagination).toHaveProperty('totalPages');
        });
    });

    it('should return users with custom limit', () => {
      return request(app.getHttpServer())
        .get('/api/users?limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.length).toBeLessThanOrEqual(5);
          expect(res.body.pagination.limit).toBe(5);
        });
    });

    it('should return second page', () => {
      return request(app.getHttpServer())
        .get('/api/users?page=2&limit=2')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.pagination.page).toBe(2);
        });
    });

    it('should reject invalid page values', () => {
      return request(app.getHttpServer())
        .get('/api/users?page=0')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should reject invalid limit values', () => {
      return request(app.getHttpServer())
        .get('/api/users?limit=0')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should reject limit exceeding maximum', () => {
      return request(app.getHttpServer())
        .get('/api/users?limit=101')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should require authentication', () => {
      return request(app.getHttpServer()).get('/api/users').expect(401);
    });
  });

  describe('/api/users (GET) - Keyword Search', () => {
    it('should search users by keyword', () => {
      return request(app.getHttpServer())
        .get('/api/users?keyword=test')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('pagination');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should combine keyword search with pagination', () => {
      return request(app.getHttpServer())
        .get('/api/users?keyword=test&page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.pagination.page).toBe(1);
          expect(res.body.pagination.limit).toBe(5);
        });
    });

    it('should reject keyword that is too long', () => {
      const longKeyword = 'a'.repeat(101);
      return request(app.getHttpServer())
        .get(`/api/users?keyword=${longKeyword}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('/api/users/:id (GET)', () => {
    it('should return user by id', async () => {
      // Get first user from list
      const listResponse = await request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      if (listResponse.body.data.length > 0) {
        const userId = listResponse.body.data[0].id;

        return request(app.getHttpServer())
          .get(`/api/users/${userId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body).toHaveProperty('id', userId);
            expect(res.body).toHaveProperty('name');
            expect(res.body).toHaveProperty('email');
          });
      }
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .get('/api/users/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should require authentication', () => {
      return request(app.getHttpServer()).get('/api/users/some-id').expect(401);
    });
  });

  describe('/api/users (POST)', () => {
    it('should create new user', () => {
      return request(app.getHttpServer())
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test User',
          email: 'newuser@example.com',
          password: 'password123',
          callname: 'TU',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('name', 'Test User');
          expect(res.body).toHaveProperty('email', 'newuser@example.com');
          testUserId = res.body.id; // Store for cleanup
        });
    });

    it('should validate required fields', () => {
      return request(app.getHttpServer())
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test User',
          // missing email and password
        })
        .expect(400);
    });

    it('should validate email format', () => {
      return request(app.getHttpServer())
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test User',
          email: 'invalid-email',
          password: 'password123',
        })
        .expect(400);
    });

    it('should validate password length', () => {
      return request(app.getHttpServer())
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: '123', // too short
        })
        .expect(400);
    });

    it('should require authentication', () => {
      return request(app.getHttpServer())
        .post('/api/users')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(401);
    });
  });

  describe('/api/users/:id (PUT)', () => {
    it('should update user', async () => {
      // Create a user first
      const createResponse = await request(app.getHttpServer())
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'User To Update',
          email: 'updateme@example.com',
          password: 'password123',
        });

      const userId = createResponse.body.id;

      return request(app.getHttpServer())
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Name',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('name', 'Updated Name');
        });
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .put('/api/users/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Name',
        })
        .expect(404);
    });

    it('should validate email format when provided', () => {
      return request(app.getHttpServer())
        .put('/api/users/some-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'invalid-email',
        })
        .expect(400);
    });

    it('should require authentication', () => {
      return request(app.getHttpServer())
        .put('/api/users/some-id')
        .send({
          name: 'Updated Name',
        })
        .expect(401);
    });
  });

  describe('/api/users/:id (DELETE)', () => {
    it('should delete user (soft delete)', async () => {
      // Create a user first
      const createResponse = await request(app.getHttpServer())
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'User To Delete',
          email: 'deleteme@example.com',
          password: 'password123',
        });

      const userId = createResponse.body.id;

      return request(app.getHttpServer())
        .delete(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('message');
        });
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .delete('/api/users/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should not return deleted user in list', async () => {
      // Create and delete a user
      const createResponse = await request(app.getHttpServer())
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Deleted User',
          email: 'deleted@example.com',
          password: 'password123',
        });

      const userId = createResponse.body.id;

      await request(app.getHttpServer())
        .delete(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Try to get the deleted user
      return request(app.getHttpServer())
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should require authentication', () => {
      return request(app.getHttpServer())
        .delete('/api/users/some-id')
        .expect(401);
    });
  });
});
