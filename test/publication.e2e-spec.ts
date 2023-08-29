import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaUtils } from './utils/prisma.utils';
import { PrismaService } from '../src/prisma/prisma.service';
import { PublicationFactory } from './factories/publication.factory';

describe('PublicationsController (e2e)', () => {
  let app: INestApplication;
  const prisma: PrismaService = new PrismaService();

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    await PrismaUtils.cleanDb(prisma);
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it('/publications (POST) should create a publication', async () => {
    const publication = await new PublicationFactory(prisma).setRandomBuild();
    await request(app.getHttpServer())
      .post('/publications')
      .send(publication)
      .expect(HttpStatus.CREATED);

    const publications = await prisma.publication.findMany();
    expect(publications).toHaveLength(1);
    expect(publications[0]).toEqual({
      id: expect.any(Number),
      mediaId: publication.mediaId,
      postId: publication.postId,
      date: new Date(publication.date),
    });
  });

  it('/publications (POST) should return a Bad Request Error when body is empty', async () => {
    const publication = {};

    await request(app.getHttpServer())
      .post('/publications')
      .send(publication)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/publications (POST) should return a Bad Request Error when mediaId is empty', async () => {
    const publicationWithoutMediaId = new PublicationFactory(prisma)
      .setPostId(1)
      .setDate('2023-09-05')
      .setBuild();

    await request(app.getHttpServer())
      .post('/publications')
      .send(publicationWithoutMediaId)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/publications (POST) should return a Bad Request Error when postId is empty', async () => {
    const publicationWithoutPostId = new PublicationFactory(prisma)
      .setMediaId(1)
      .setDate('2023-09-05')
      .setBuild();

    await request(app.getHttpServer())
      .post('/publications')
      .send(publicationWithoutPostId)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/publications (POST) should return a Bad Request Error when date is empty', async () => {
    const publicationWithoutPostId = new PublicationFactory(prisma)
      .setMediaId(1)
      .setMediaId(1)
      .setBuild();

    await request(app.getHttpServer())
      .post('/publications')
      .send(publicationWithoutPostId)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/publications (GET) should return an empty array when not exist publications', async () => {
    const { body, status } = await request(app.getHttpServer()).get(
      '/publications',
    );
    expect(status).toBe(HttpStatus.OK);
    expect(body).toHaveLength(0);
  });

  it('/publications (GET) should get all publications', async () => {
    await new PublicationFactory(prisma).createRandomPublication();
    await new PublicationFactory(prisma).createRandomPublication();
    await new PublicationFactory(prisma).createRandomPublication();

    const { body, status } = await request(app.getHttpServer()).get(
      '/publications',
    );
    expect(status).toBe(HttpStatus.OK);
    expect(body).toHaveLength(3);
  });

  it('/publications/:id (GET) should get a publication by id', async () => {
    const publication = await new PublicationFactory(
      prisma,
    ).createRandomPublication();

    const { body, status } = await request(app.getHttpServer()).get(
      `/publications/${publication.id}`,
    );
    expect(status).toBe(HttpStatus.OK);
    expect(body).toEqual({
      ...publication,
      date: publication.date.toISOString(),
    });
  });

  it('/publications/:id (GET) should return Not Found Error when id not exist', async () => {
    const { id } = await new PublicationFactory(
      prisma,
    ).createRandomPublication();

    const { status } = await request(app.getHttpServer()).get(
      `/publications/${id + 1}`,
    );
    expect(status).toBe(HttpStatus.NOT_FOUND);
  });

  it('/publications/:id (PUT) should return status 200 and update a publication by id', async () => {
    const { id } = await new PublicationFactory(
      prisma,
    ).createRandomPublication();
    const updatePublication = await new PublicationFactory(
      prisma,
    ).setRandomBuild();

    const { status, body } = await request(app.getHttpServer())
      .put(`/publications/${id}`)
      .send(updatePublication);

    expect(status).toBe(HttpStatus.OK);
    expect(body).toEqual({
      ...updatePublication,
      id: id,
    });
  });

  it('/publications/:id (PUT) should return Not Found Error 404 when publication not exist', async () => {
    const { id } = await new PublicationFactory(
      prisma,
    ).createRandomPublication();

    const updatePublication = await new PublicationFactory(
      prisma,
    ).setRandomBuild();

    const { status } = await request(app.getHttpServer())
      .put(`/publications/${id + 1}`)
      .send(updatePublication);

    expect(status).toBe(HttpStatus.NOT_FOUND);
  });

  it('/publications/:id (DELETE) should return Not Found Error 404 when publication not exist', async () => {
    const { id } = await new PublicationFactory(
      prisma,
    ).createRandomPublication();

    await request(app.getHttpServer())
      .delete(`/publications/${id + 1}`)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('/publications/:id (DELETE) should return status 200 and delete post by id', async () => {
    const { id } = await new PublicationFactory(
      prisma,
    ).createRandomPublication();

    await request(app.getHttpServer())
      .delete(`/publications/${id}`)
      .expect(HttpStatus.OK);
  });
});
