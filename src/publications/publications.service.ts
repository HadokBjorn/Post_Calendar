import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { UpdatePublicationDto } from './dto/update-publication.dto';
import { PublicationsRepository } from './publications.repository';
import { MediasService } from '../medias/medias.service';
import { PostsService } from '../posts/posts.service';

@Injectable()
export class PublicationsService {
  constructor(
    private readonly publicationRepository: PublicationsRepository,
    private readonly mediaService: MediasService,
    private readonly postService: PostsService,
  ) {}
  async create(createPublicationDto: CreatePublicationDto) {
    await this.validationPublication(createPublicationDto);
    return await this.publicationRepository.createPublication(
      createPublicationDto,
    );
  }

  async findAll(published?: boolean, after?: Date) {
    const today = new Date();
    if (published && after) {
      //because not exist posting in future
      if (after > today) return [];

      return await this.publicationRepository.getPublicationsPublishedAndAfter(
        after,
      );
    }
    if (published && !after) {
      return await this.publicationRepository.getPublicationsPublished(today);
    }
    if (published === undefined && after) {
      return await this.publicationRepository.getPublicationsAfter(after);
    }
    if (published === false && after) {
      const date = after > today ? after : today;
      return await this.publicationRepository.getPublicationsNotPublished(date);
    }

    if (published === false && !after) {
      return await this.publicationRepository.getPublicationsNotPublished(
        today,
      );
    }

    return await this.publicationRepository.getPublications();
  }

  async findOne(id: number) {
    const publication = await this.publicationRepository.getPublicationById(id);
    if (!publication) {
      throw new NotFoundException(`Publication with id #${id} not exist`);
    }
    return publication;
  }

  async update(id: number, updatePublicationDto: UpdatePublicationDto) {
    const { mediaId, postId, date } = updatePublicationDto;
    if (!mediaId && !postId && !date) {
      throw new BadRequestException('Body to update is required');
    }
    const publication = await this.publicationRepository.getPublicationById(id);
    if (!publication) {
      throw new NotFoundException(`Publication with id #${id} not exist`);
    }
    await this.validationPublication(updatePublicationDto);
    if (this.pastDateVerification(new Date(date))) {
      throw new ForbiddenException('You cannot update publication in the past');
    }
    return await this.publicationRepository.updatePublication(
      id,
      updatePublicationDto,
    );
  }

  async remove(id: number) {
    const publication = await this.publicationRepository.getPublicationById(id);
    if (!publication) {
      throw new NotFoundException(`Publication with id #${id} not exist`);
    }
    return await this.publicationRepository.deletePublication(id);
  }

  private async validationPublication(
    publication: CreatePublicationDto | UpdatePublicationDto,
  ) {
    const { mediaId, postId } = publication;
    if (mediaId) await this.mediaService.findOne(mediaId);
    if (postId) await this.postService.findOne(postId);
  }

  private pastDateVerification(date: Date) {
    const today = new Date();
    return date < today;
  }
}
