import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMediaDto } from './dto/create-media.dto';

@Injectable()
export class MediasRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createMedia(media: CreateMediaDto) {
    const { title, username } = media;
    return await this.prisma.media.create({
      data: {
        title,
        username,
      },
    });
  }

  async getMedias() {
    return this.prisma.media.findMany();
  }

  async getMediasByTitleAndUsername(media: CreateMediaDto) {
    const { title, username } = media;
    return this.prisma.media.findFirst({
      where: { title, username },
    });
  }
}
