import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';

@Injectable()
export class MediasRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createMedia(media: CreateMediaDto) {
    return await this.prisma.media.create({
      data: media,
    });
  }

  async getMedias() {
    return await this.prisma.media.findMany();
  }

  async getMediasByTitleAndUsername(media: CreateMediaDto) {
    return await this.prisma.media.findUnique({
      where: {
        title_username: media,
      },
    });
  }

  async getMediaById(id: number) {
    return await this.prisma.media.findUnique({
      where: { id: id },
    });
  }

  async getMediaWithPublications(id: number) {
    return await this.prisma.media.findUnique({
      where: { id },
      include: { publications: true },
    });
  }

  async updateMedia(id: number, updateMedia: UpdateMediaDto) {
    return await this.prisma.media.update({
      data: updateMedia,
      where: { id },
    });
  }

  async deleteMedia(id: number) {
    return await this.prisma.media.delete({
      where: { id },
    });
  }
}
