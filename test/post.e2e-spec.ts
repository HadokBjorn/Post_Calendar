import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaUtils } from './utils/prisma.utils';
import { PrismaService } from '../src/prisma/prisma.service';
import { PostFactory } from './factories/post.factory';
import { MediaFactory } from './factories/media.factory';

describe('PostsController (e2e)', () => {
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

  it('/posts (POST) should create a post', async () => {
    const post = new PostFactory(prisma).setRandomBuildWithImage();
    await request(app.getHttpServer())
      .post('/posts')
      .send(post)
      .expect(HttpStatus.CREATED);

    const posts = await prisma.post.findMany();
    expect(posts).toHaveLength(1);
    expect(posts[0]).toEqual({
      id: expect.any(Number),
      title: post.title,
      text: post.text,
      image: post.image,
    });
  });

  it('/posts (POST) should return a Bad Request Error when body is empty', async () => {
    const post = {};

    await request(app.getHttpServer())
      .post('/posts')
      .send(post)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/posts (POST) should return a Bad Request Error when title is empty', async () => {
    const postWithoutTitle = new PostFactory(prisma)
      .setText('this is my text test')
      .setBuild();

    await request(app.getHttpServer())
      .post('/posts')
      .send(postWithoutTitle)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/posts (POST) should return a Bad Request Error when text is empty', async () => {
    const postWithoutText = new PostFactory(prisma)
      .setTitle('This is my title post')
      .setBuild();

    await request(app.getHttpServer())
      .post('/posts')
      .send(postWithoutText)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/posts (GET) should return an empty array when not exist posts', async () => {
    const { body, status } = await request(app.getHttpServer()).get('/posts');
    expect(status).toBe(HttpStatus.OK);
    expect(body).toHaveLength(0);
  });

  it('/posts (GET) should get all posts', async () => {
    await new PostFactory(prisma).createRandomPostWithImage();
    await new PostFactory(prisma).createRandomPostWithImage();
    await new PostFactory(prisma).createRandomPostWithImage();

    const { body, status } = await request(app.getHttpServer()).get('/posts');
    expect(status).toBe(HttpStatus.OK);
    expect(body).toHaveLength(3);
  });

  it('/posts/:id (GET) should get a post by id', async () => {
    const post = await new PostFactory(prisma).createRandomPostWithImage();

    const { body, status } = await request(app.getHttpServer()).get(
      `/posts/${post.id}`,
    );
    expect(status).toBe(HttpStatus.OK);
    expect(body).toEqual(post);
  });

  it('/posts/:id (GET) should return Not Found Error when id not exist', async () => {
    const { id } = await new PostFactory(prisma).createRandomPostWithImage();

    const { status } = await request(app.getHttpServer()).get(
      `/posts/${id + 1}`,
    );
    expect(status).toBe(HttpStatus.NOT_FOUND);
  });

  it('/posts/:id (PUT) should return status 200 and update a post by id', async () => {
    const { id } = await new PostFactory(prisma).createRandomPostWithImage();
    const updatePost = new PostFactory(prisma).setRandomBuildWithImage();

    const { status, body } = await request(app.getHttpServer())
      .put(`/posts/${id}`)
      .send(updatePost);

    expect(status).toBe(HttpStatus.OK);
    expect(body).toEqual({
      id: id,
      title: updatePost.title,
      text: updatePost.text,
      image: updatePost.image,
    });
  });

  it('/posts/:id (PUT) should return Not Found Error 404 when post not exist', async () => {
    const { id } = await new PostFactory(prisma).createRandomPostWithImage();

    const { status } = await request(app.getHttpServer())
      .put(`/posts/${id + 1}`)
      .send({ title: 'This is my title' });

    expect(status).toBe(HttpStatus.NOT_FOUND);
  });

  it('/posts/:id (DELETE) should return Forbidden Error 403 when post is schedule or published', async () => {
    //setup
    const media = await new MediaFactory(prisma).createRandomMedia();
    const post = await new PostFactory(prisma).createRandomPostWithImage();
    await prisma.publication.create({
      data: {
        mediaId: media.id,
        postId: post.id,
        date: new Date(),
      },
    });
    //test
    await request(app.getHttpServer())
      .delete(`/posts/${post.id}`)
      .expect(HttpStatus.FORBIDDEN);
  });

  it('/posts/:id (DELETE) should return Not Found Error 404 when post not exist', async () => {
    const { id } = await new PostFactory(prisma).createRandomPostWithImage();

    await request(app.getHttpServer())
      .delete(`/posts/${id + 1}`)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('/posts/:id (DELETE) should return status 200 and delete post by id', async () => {
    const { id } = await new PostFactory(prisma).createRandomPostWithImage();

    await request(app.getHttpServer())
      .delete(`/posts/${id}`)
      .expect(HttpStatus.OK);
  });
});
