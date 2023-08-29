import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { UpdatePublicationDto } from './dto/update-publication.dto';

@Injectable()
export class PublicationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createPublication(publication: CreatePublicationDto) {
    return await this.prisma.publication.create({
      data: publication,
    });
  }

  async getPublications() {
    return await this.prisma.publication.findMany();
  }

  async getPublicationById(id: number) {
    return await this.prisma.publication.findUnique({
      where: { id: id },
    });
  }

  async updatePublication(id: number, updatePublication: UpdatePublicationDto) {
    return await this.prisma.publication.update({
      data: updatePublication,
      where: { id },
    });
  }

  async deletePublication(id: number) {
    return await this.prisma.publication.delete({
      where: { id },
    });
  }
}
