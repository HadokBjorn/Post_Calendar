import { PrismaService } from 'src/prisma/prisma.service';
import { faker } from '@faker-js/faker';

export class PostFactory {
  private title: string;
  private text: string;
  private image: string;

  constructor(private readonly prisma: PrismaService) {}

  setTitle(title: string) {
    this.title = title;
    return this;
  }

  setText(text: string) {
    this.text = text;
    return this;
  }
  setImage(image: string) {
    this.image = image;
    return this;
  }

  setBuild() {
    return {
      title: this.title,
      text: this.text,
      image: this.image,
    };
  }

  setRandomBuildWithoutImage() {
    return {
      title: faker.hacker.adjective(),
      text: faker.hacker.phrase(),
    };
  }

  setRandomBuildWithImage() {
    return {
      title: faker.hacker.adjective(),
      text: faker.hacker.phrase(),
      image: faker.image.url(),
    };
  }

  async createPost() {
    const post = this.setBuild();
    return await this.prisma.post.create({
      data: post,
    });
  }

  async createRandomPostWithImage() {
    const post = this.setRandomBuildWithImage();
    return await this.prisma.post.create({
      data: post,
    });
  }

  async createRandomPostWithoutImage() {
    const post = this.setRandomBuildWithoutImage();
    return await this.prisma.post.create({
      data: post,
    });
  }
}
