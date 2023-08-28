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
    return await this.prisma.media.findFirst({
      where: media,
    });
  }

  async getMediaById(id: number) {
    return await this.prisma.media.findUnique({
      where: { id: id },
    });
  }

  async updateMedia(id: number, updateMedia: UpdateMediaDto) {
    return await this.prisma.media.update({
      data: updateMedia,
      where: { id },
    });
  }
}
