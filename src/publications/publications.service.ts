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

  async findAll() {
    return await this.publicationRepository.getPublications();
  }

  //TODO: Implementar filtros de query string
  // fazer aqui

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
    this.pastDateVerification(new Date(date));
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
    if (date < today) {
      throw new ForbiddenException('You cannot update publication in the past');
    }
  }
}
