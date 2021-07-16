import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import path from 'path';
import { Pool } from 'pg';
import 'reflect-metadata';
import { buildSchema } from 'type-graphql';
import { createConnection } from 'typeorm';
import { Post } from './entities/post';
import { User } from './entities/user';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import { MyContext } from './types';
import 'dotenv-safe/config';

const main = async () => {
  require('dotenv').config();

  const c = await createConnection({
    type: 'postgres',
    host: process.env.HOST,
    database: process.env.DATABASE,
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
    logging: true,
    synchronize: false,
    migrations: [path.join(__dirname, './migrations/*')],
    entities: [User, Post],
  });

  await c.runMigrations();

  const app = express();

  app.set('trust proxy', 1);
  const pool = new Pool({
    user: process.env.USERNAME,
    host: process.env.HOST,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    // port: 5433,
  });

  const pSession = new (require('connect-pg-simple')(session))();
  pSession.pool = pool;

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    }),
  );

  app.use(
    session({
      name: 'mycookie',
      store: pSession,
      secret: `${process.env.SESSION_SECRET}`, // disable warning about deprecated
      resave: false,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000, //30 days
        secure: false,
        httpOnly: true,
        sameSite: 'lax',
      },
      saveUninitialized: false,
    }),
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({
      req,
      res,
      // userLoader: createUserLoader(),
    }),
  });

  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(process.env.PORT, () => {
    console.log('Server started');
  });
};

main().catch((err) => {
  console.error(err);
});
