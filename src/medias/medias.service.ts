import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
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
      await this.mediasRepository.getMediasByTitleAndUsername(media);

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

  async update(id: number, updateMedia: UpdateMediaDto) {
    const { title, username } = updateMedia;
    let mediaWithSameBody: any;

    if (!title && !username) {
      throw new BadRequestException('Update body is required');
    }
    const mediaToUpdate = await this.mediasRepository.getMediaById(id);
    if (!mediaToUpdate) {
      throw new NotFoundException(`Media with id ${id} not exist`);
    }
    if (!title) {
      mediaWithSameBody =
        await this.mediasRepository.getMediasByTitleAndUsername({
          title: mediaToUpdate.title,
          username,
        });
    }
    if (!username) {
      mediaWithSameBody =
        await this.mediasRepository.getMediasByTitleAndUsername({
          title,
          username: mediaToUpdate.username,
        });
    }
    mediaWithSameBody =
      await this.mediasRepository.getMediasByTitleAndUsername(updateMedia);

    if (mediaWithSameBody) {
      throw new ConflictException(`Media with your updates already exist`);
    }

    return await this.mediasRepository.updateMedia(id, updateMedia);
  }

  async remove(id: number) {
    const media = await this.mediasRepository.getMediaWithPublications(id);
    if (!media) throw new NotFoundException(`Media with id #${id} not exist`);
    if (media.publications.length > 0) {
      throw new ForbiddenException(
        'the media is scheduled to be published or has already been posted.',
      );
    }
    return await this.mediasRepository.deleteMedia(id);
  }
}
