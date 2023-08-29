import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createPost(post: CreatePostDto) {
    return await this.prisma.post.create({
      data: post,
    });
  }

  async getPosts() {
    return await this.prisma.post.findMany();
  }

  async getPostById(id: number) {
    return await this.prisma.post.findUnique({
      where: { id: id },
    });
  }

  async getPostWithPublications(id: number) {
    return await this.prisma.post.findUnique({
      where: { id },
      include: { publications: true },
    });
  }

  async updatePost(id: number, updatePost: UpdatePostDto) {
    return await this.prisma.post.update({
      data: updatePost,
      where: { id },
    });
  }

  async deletePost(id: number) {
    return await this.prisma.post.delete({
      where: { id },
    });
  }
}
