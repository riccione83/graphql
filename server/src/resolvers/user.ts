import { MyContext } from '../types';
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql';
import { User } from '../entities/user';
import argon2 from 'argon2';
import { Post } from '../entities/post';

@InputType()
class UserNamePasswordInput {
  @Field()
  username: string;

  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class LoginResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Mutation(() => User)
  async register(
    @Arg('options') options: UserNamePasswordInput,
  ): Promise<User> {
    const hash = await argon2.hash(options.password);
    const user = User.create({
      username: options.username,
      password: hash,
    }).save();
    return user;
  }

  @Query(() => [Post])
  getPosts(@Arg('userId') userId: number): Promise<Post[]> {
    const posts = Post.find({ where: { userId: userId } });
    return posts;
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() { req, res }: MyContext): Promise<boolean> {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie('mycookie');
        if (err) {
          resolve(false);
          return;
        }

        resolve(true);
      }),
    );

    return true;
  }

  @Mutation(() => LoginResponse)
  async login(
    @Arg('username') username: string,
    @Arg('password') password: string,
    @Ctx() { req }: MyContext,
  ): Promise<LoginResponse> {
    const user = await User.findOne({ where: { username: username } });

    if (user) {
      const verify = await argon2.verify(user.password, password);

      if (verify) {
        user.posts = await Post.find({ where: { userId: user.id } });
        // const posts = await em.find(Post, { userId: user.id });
        // await em.populate(user.posts, { userId: user.id });
        req.session.userId = user.id;
        req.session.save();
        return { user };
      }
    }
    return {
      errors: [{ field: 'login', message: 'User not found' }],
    };
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() { req }: MyContext): Promise<User | undefined> {
    const userId = req.session.userId;
    if (!userId) {
      return undefined;
    }
    // const user = await
    // if (user) {
    //   return user;
    // }
    return User.findOne(parseInt(userId));
  }
}
