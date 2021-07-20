import { Post } from '../entities/post';
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Int,
  Mutation,
  Query,
  Resolver,
} from 'type-graphql';
import { MyContext } from 'src/types';
import { FileUpload, GraphQLUpload, Upload } from 'graphql-upload';
import path from 'path';
import { createWriteStream } from 'fs';
import { GraphQLNonNull } from 'graphql';

export class FileInput implements Partial<any> {
  @Field() filename: string;

  @Field() mimetype: string;

  @Field() encoding: string;
}

@Resolver()
export class PostResolver {
  @Query(() => [Post], { nullable: true })
  posts(@Ctx() { req }: MyContext): Promise<Post[]> {
    const userId = req.session.userId;

    return Post.find({ where: { userId: userId } });
  }

  @Query(() => Post, { nullable: true })
  post(@Arg('id', () => Int) id: number): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  @Mutation(() => Post)
  async createPost(
    @Arg('title') title: string,
    @Ctx() { req }: MyContext,
  ): Promise<Post | undefined> {
    const userId = req.session.userId;
    if (!userId) {
      return undefined;
    }
    const post = await Post.create({ title: title, userId: userId });
    return post.save();
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg('id') id: number,
    @Arg('title') title: string,
  ): Promise<Post | null> {
    const post = await Post.findOne(id);
    if (!post) {
      return null;
    }

    if (typeof title !== undefined) {
      post.title = title;
      await Post.update({ id }, { title });
    }
    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg('id') id: number): Promise<Boolean> {
    await Post.delete(id);
    return true;
  }

  @Mutation(() => Post, { nullable: true })
  async uploadImage(
    @Arg('id', () => Int!) id: number
    @Arg('file', () => GraphQLUpload)
    file: FileUpload,
  ): Promise<Post | null> {
    const { createReadStream, filename } = await file;
    const destinationPath = path.join('../../uploads/images', filename);

    const post = await Post.findOne(id);
    if (!post) {
      return null;
    }

    console.info('Savings', file);

    await new Promise((res) =>
      createReadStream().pipe(
        createWriteStream(path.join(__dirname, destinationPath))
          .on('error', (err) => console.error(err))
          .on('close', res),
      ),
    );
    return post;
  }
}
