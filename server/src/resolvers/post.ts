import { Post } from '../entities/post';
import { Arg, Ctx, Int, Mutation, Query, Resolver } from 'type-graphql';
import { MyContext } from 'src/types';
import { FileUpload, GraphQLUpload } from 'graphql-upload';

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
    @Ctx() { req, s3 }: MyContext,
    @Arg('title') title: string,
    @Arg('file', () => GraphQLUpload, { nullable: true }) file?: FileUpload,
  ): Promise<Post | undefined> {
    const userId = req.session.userId;
    if (!userId) {
      return undefined;
    }
    const post = Post.create({ title: title, userId: userId });
    const id = (await post.save()).id;
    if (file) {
      const { createReadStream } = await file;
      const body = createReadStream();
      const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: `${id}`,
        Body: body,
      };
      const data = await s3.upload(params, {}).promise();
      post.imagePath = data.Location;
      return post.save();
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
  async deletePost(
    @Ctx() { s3 }: MyContext,
    @Arg('id') id: number,
  ): Promise<Boolean> {
    const post = await Post.findOne({ id });
    if (post && post.imagePath) {
      var params = {
        Bucket: process.env.BUCKET_NAME,
        Key: `${post.id}`,
      };
      try {
        await s3.headObject(params).promise();
        console.log('File Found in S3');
        try {
          await s3.deleteObject(params).promise();
          console.log('file deleted Successfully');
        } catch (err) {
          console.log('ERROR in file Deleting : ' + JSON.stringify(err));
        }
      } catch (err) {
        console.log('File not Found ERROR : ' + err.code);
      }
    }
    await Post.delete(id);
    return true;
  }
}
