import { ConflictException, Injectable } from '@nestjs/common';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { MediasRepository } from './medias.repository';

@Injectable()
export class MediasService {
  constructor(private readonly mediasRepository: MediasRepository) {}

  createMedia(media: CreateMediaDto) {
    const alreadyExistMedia =
      this.mediasRepository.getMediasByTitleAndUsername(media);
    if (alreadyExistMedia) throw new ConflictException('Media already exist');

    return this.mediasRepository.createMedia(media);
  }

  findAll() {
    return this.mediasRepository.getMedias();
  }

  findOne(id: number) {
    return `This action returns a #${id} media`;
  }

  update(id: number, updateMediaDto: UpdateMediaDto) {
    return `This action updates a #${id} media`;
  }

  remove(id: number) {
    return `This action removes a #${id} media`;
  }
}
