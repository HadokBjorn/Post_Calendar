import { PrismaService } from 'src/prisma/prisma.service';
import { faker } from '@faker-js/faker';
import { MediaFactory } from './media.factory';
import { PostFactory } from './post.factory';

export class PublicationFactory {
  private mediaId: number;
  private postId: number;
  private date: string;

  constructor(private readonly prisma: PrismaService) {}

  setMediaId(mediaId: number) {
    this.mediaId = mediaId;
    return this;
  }

  setPostId(postId: number) {
    this.postId = postId;
    return this;
  }
  setDate(date: string) {
    this.date = date;
    return this;
  }

  setBuild() {
    return {
      mediaId: this.mediaId,
      postId: this.postId,
      date: this.date,
    };
  }

  async setRandomBuild() {
    const media = await new MediaFactory(this.prisma).createRandomMedia();
    const post = await new PostFactory(this.prisma).createRandomPostWithImage();
    return {
      mediaId: media.id,
      postId: post.id,
      date: faker.date.future({ refDate: new Date() }).toISOString(),
    };
  }

  async createPublication() {
    const publication = this.setBuild();
    return await this.prisma.publication.create({
      data: publication,
    });
  }

  async createRandomPublication() {
    const publication = await this.setRandomBuild();
    return await this.prisma.publication.create({
      data: publication,
    });
  }
}
