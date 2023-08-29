import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaUtils } from './utils/prisma.utils';
import { MediaFactory } from './factories/media.factory';
import { PrismaService } from '../src/prisma/prisma.service';

describe('MediaController (e2e)', () => {
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

  it('/medias (POST) should create a media', async () => {
    const media = new MediaFactory(prisma).setRandomBuild();
    await request(app.getHttpServer())
      .post('/medias')
      .send(media)
      .expect(HttpStatus.CREATED);

    const medias = await prisma.media.findMany();
    expect(medias).toHaveLength(1);
    expect(medias[0]).toEqual({
      id: expect.any(Number),
      title: media.title,
      username: media.username,
    });
  });

  it('/medias (POST) should return a Bad Request Error when body is empty', async () => {
    const media = {};

    await request(app.getHttpServer())
      .post('/medias')
      .send(media)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/medias (POST) should return a Bad Request Error when title is empty', async () => {
    const media = new MediaFactory(prisma).setUsername('@test_123').setBuild();

    await request(app.getHttpServer())
      .post('/medias')
      .send(media)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/medias (POST) should return a Bad Request Error when username is empty', async () => {
    const media = new MediaFactory(prisma).setTitle('Instagram').setBuild();

    await request(app.getHttpServer())
      .post('/medias')
      .send(media)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/medias (POST) should not create a media with title and username duplicated', async () => {
    const media = await new MediaFactory(prisma).createRandomMedia();
    const duplicatedMedia = {
      title: media.title,
      username: media.username,
    };
    await request(app.getHttpServer())
      .post('/medias')
      .send(duplicatedMedia)
      .expect(HttpStatus.CONFLICT);
  });

  it('/medias (GET) should return an empty array when not exist medias', async () => {
    const { body, status } = await request(app.getHttpServer()).get('/medias');
    expect(status).toBe(HttpStatus.OK);
    expect(body).toHaveLength(0);
  });

  it('/medias (GET) should get all medias', async () => {
    await new MediaFactory(prisma).createRandomMedia();
    await new MediaFactory(prisma).createRandomMedia();
    await new MediaFactory(prisma).createRandomMedia();

    const { body, status } = await request(app.getHttpServer()).get('/medias');
    expect(status).toBe(HttpStatus.OK);
    expect(body).toHaveLength(3);
  });

  it('/medias/:id (GET) should get a media by id', async () => {
    const media = await new MediaFactory(prisma).createRandomMedia();

    const { body, status } = await request(app.getHttpServer()).get(
      `/medias/${media.id}`,
    );
    expect(status).toBe(HttpStatus.OK);
    expect(body).toEqual(media);
  });

  it('/medias/:id (GET) should return Not Found Error when id not exist', async () => {
    const { id } = await new MediaFactory(prisma).createRandomMedia();

    const { status } = await request(app.getHttpServer()).get(
      `/medias/${id + 1}`,
    );
    expect(status).toBe(HttpStatus.NOT_FOUND);
  });

  it('/medias/:id (PUT) should return status 200 and update a media by id', async () => {
    const { id } = await new MediaFactory(prisma).createRandomMedia();
    const updateMedia = new MediaFactory(prisma).setRandomBuild();

    const { status, body } = await request(app.getHttpServer())
      .put(`/medias/${id}`)
      .send(updateMedia);

    expect(status).toBe(HttpStatus.OK);
    expect(body).toEqual({
      id: id,
      title: updateMedia.title,
      username: updateMedia.username,
    });
  });

  it('/medias/:id (PUT) should return Conflict Error 409 when media update is the same as existing media', async () => {
    const { id, title, username } = await new MediaFactory(
      prisma,
    ).createRandomMedia();

    const { status } = await request(app.getHttpServer())
      .put(`/medias/${id}`)
      .send({ title, username });

    expect(status).toBe(HttpStatus.CONFLICT);
  });

  it('/medias/:id (PUT) should return Not Found Error 404 when media not exist', async () => {
    const { id } = await new MediaFactory(prisma).createRandomMedia();

    const { status } = await request(app.getHttpServer())
      .put(`/medias/${id + 1}`)
      .send({ title: 'test@test_123' });

    expect(status).toBe(HttpStatus.NOT_FOUND);
  });

  //TODO: Fazer a implementação desse test quando existir a post factory

  /* it('/medias/:id (DELETE) should return Forbidden Error 403 when media is schedule or published', async () => {
    const { id } = await new MediaFactory(prisma).createRandomMedia();

    const { status } = await request(app.getHttpServer())
      .delete(`/medias/${ id }`)
      .send({ title: 'test@test_123' });

    expect(status).toBe(HttpStatus.NOT_FOUND);
  }); */

  it('/medias/:id (DELETE) should return Not Found Error 404 when media not exist', async () => {
    const { id } = await new MediaFactory(prisma).createRandomMedia();

    await request(app.getHttpServer())
      .delete(`/medias/${id + 1}`)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('/medias/:id (DELETE) should return status 200 and delete media by id', async () => {
    const { id } = await new MediaFactory(prisma).createRandomMedia();

    await request(app.getHttpServer())
      .delete(`/medias/${id}`)
      .expect(HttpStatus.OK);
  });
});
