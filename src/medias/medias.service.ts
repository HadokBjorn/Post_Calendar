import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { MediasRepository } from './medias.repository';

@Injectable()
export class MediasService {
  constructor(private readonly mediasRepository: MediasRepository) {}

  async createMedia(media: CreateMediaDto) {
    const alreadyExistMedia =
      this.mediasRepository.getMediasByTitleAndUsername(media);
    if (alreadyExistMedia) throw new ConflictException('Media already exist');

    return await this.mediasRepository.createMedia(media);
  }

  async findAll() {
    return await this.mediasRepository.getMedias();
  }

  async findOne(id: number) {
    const media = await this.mediasRepository.getMediaById(id);
    if (!media) throw new NotFoundException('Media not exist');
    return media;
  }

  async update(id: number, updateMediaDto: UpdateMediaDto) {
    return `This action updates a #${id} media`;
  }

  async remove(id: number) {
    return `This action removes a #${id} media`;
  }
}
