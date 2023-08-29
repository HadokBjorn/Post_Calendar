import { PrismaService } from 'src/prisma/prisma.service';
import { faker } from '@faker-js/faker';

export class MediaFactory {
  private title: string;
  private username: string;

  constructor(private readonly prisma: PrismaService) {}

  setTitle(title: string) {
    this.title = title;
    return this;
  }

  setUsername(username: string) {
    this.username = username;
    return this;
  }

  setBuild() {
    return {
      title: this.title,
      username: this.username,
    };
  }

  setRandomBuild() {
    return {
      title: faker.hacker.abbreviation(),
      username: faker.internet.userName(),
    };
  }

  async createMedia() {
    const media = this.setBuild();
    return await this.prisma.media.create({
      data: media,
    });
  }

  async createRandomMedia() {
    const media = this.setRandomBuild();
    return await this.prisma.media.create({
      data: media,
    });
  }
}
