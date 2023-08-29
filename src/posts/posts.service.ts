import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsRepository } from './posts.repository';

@Injectable()
export class PostsService {
  constructor(private readonly postsRepository: PostsRepository) {}

  async create(createPostDto: CreatePostDto) {
    return await this.postsRepository.createPost(createPostDto);
  }

  async findAll() {
    return await this.postsRepository.getPosts();
  }

  async findOne(id: number) {
    const post = await this.postsRepository.getPostById(id);
    if (!post) throw new NotFoundException(`Post with id #${id} not exist`);
    return post;
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    const { title, text } = updatePostDto;

    if (!title && !text) {
      throw new BadRequestException('Update body is required');
    }
    const postToUpdate = await this.postsRepository.getPostById(id);
    if (!postToUpdate) {
      throw new NotFoundException(`Post with id #${id} not exist`);
    }

    return await this.postsRepository.updatePost(id, updatePostDto);
  }

  async remove(id: number) {
    const post = await this.postsRepository.getPostWithPublications(id);
    if (!post) throw new NotFoundException(`post with id #${id} not exist`);
    if (post.publications.length > 0) {
      throw new ForbiddenException(
        'the post is scheduled to be published or has already been posted.',
      );
    }
    return await this.postsRepository.deletePost(id);
  }
}
