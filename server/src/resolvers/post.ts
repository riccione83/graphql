import { Post } from '../entities/post';
import { Arg, Ctx, Field, Int, Mutation, Query, Resolver } from 'type-graphql';
import { MyContext } from 'src/types';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
import path, { resolve } from 'path';
import { createWriteStream } from 'fs';
import url from 'url';
import fse from 'fs-extra';

function fullUrl(req: any) {
  return url.format({
    protocol: req.protocol,
    host: req.get('host'),
    // pathname: req.originalUrl,
  });
}

@Resolver()
export class PostResolver {
  @Query(() => [Post], { nullable: true })
  posts(@Ctx() { req }: MyContext): Promise<Post[]> {
    const userId = req.session.userId;

    return Post.find({ where: { userId: userId }, order: { id: 'ASC' } });
  }

  @Query(() => Post, { nullable: true })
  post(@Arg('id', () => Int) id: number): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  @Mutation(() => Post)
  async createPost(
    @Ctx() { req }: MyContext,
    @Arg('title') title: string,
    @Arg('file', () => GraphQLUpload, { nullable: true }) file?: FileUpload,
  ): Promise<Post | undefined> {
    const userId = req.session.userId;
    if (!userId) {
      return undefined;
    }
    const post = await Post.create({ title: title, userId: userId });

    if (file) {
      const { createReadStream, filename } = await file;
      const destinationPath = path.join('../../uploads/images', filename);
      const imagePath = fullUrl(req) + '/uploads/' + filename;

      post.imagePath = imagePath;
      await post.save();
      await new Promise((res) =>
        createReadStream().pipe(
          createWriteStream(path.join(__dirname, destinationPath))
            .on('error', (err) => console.error(err))
            .on('close', res),
        ),
      );
      await fse.copy(
        path.join(__dirname, '../../uploads/images'),
        path.join(__dirname, '../../dist/uploads/images'),
        {
          overwrite: true,
        },
        (err) => {
          if (err) {
            console.error(err);
          } else {
            console.log('success!');
          }
        },
      );

      return post;
    } else {
      return post.save();
    }
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
    @Arg('id', () => Int!) id: number,
    @Arg('file', () => GraphQLUpload) file: FileUpload,
    @Ctx()
    { req }: MyContext,
  ): Promise<Post | null> {
    const { createReadStream, filename } = await file;
    const destinationPath = path.join('../../uploads/images', filename);
    const imagePath = fullUrl(req) + '/uploads/' + filename;
    const post = await Post.findOne(id);
    if (!post) {
      return null;
    }

    post.imagePath = imagePath;
    await post.save();
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
