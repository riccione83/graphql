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
import { graphqlUploadExpress } from 'graphql-upload';
import fetch from 'node-fetch';
import { __prod__ } from './constants';
import {
  // ApolloServerPluginLandingPageDisabled,
  ApolloServerPluginLandingPageGraphQLPlayground,
} from 'apollo-server-core';
import aws from 'aws-sdk';

const main = async () => {
  require('dotenv').config();

  if (process.env.AWS_ID === '') {
    console.error('NO AWS KEY FOUND');
  }

  try {
    await createConnection({
      type: 'postgres',
      ssl: __prod__
        ? {
            rejectUnauthorized: false,
          }
        : false,
      url: process.env.DATABASE_URL,
      // host: process.env.HOST,
      database: process.env.DATABASE,
      username: process.env.USERNAME,
      password: process.env.PASSWORD,
      logging: true,
      synchronize: false,
      migrations: [path.join(__dirname, './migrations/*')],
      entities: [User, Post],
    }).then(async (c) => {
      if (process.env.MIGRATION === '1') {
        await c.runMigrations();
      }
    });
  } catch {
    console.log('Unable to connect to DB');
  }

  const app = express();

  app.set('trust proxy', 1);

  var corsOptions = {
    origin: [process.env.CORS_ORIGIN, 'https://studio.apollographql.com'],
    optionsSuccessStatus: 200, // For legacy browser support
    credentials: true,
  };

  app.all(process.env.CORS_ORIGIN, function (req, res, next) {
    let origin = req.headers.origin;
    if (origin && corsOptions.origin.indexOf(origin) >= 0) {
      res.header('Access-Control-Allow-Origin', origin);
    }

    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Headers', 'Set-Cookie');
    next();
  });

  const pool = new Pool({
    user: process.env.USERNAME,
    // host: process.env.HOST,
    connectionString: process.env.DATABASE_URL,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    ssl: __prod__
      ? {
          rejectUnauthorized: false,
        }
      : false,
    // port: 5433,
  });

  const pSession = new (require('connect-pg-simple')(session))();
  pSession.pool = pool;

  app.use(
    session({
      name: 'mycookie',
      store: pSession,
      secret: `${process.env.SESSION_SECRET}`, // disable warning about deprecated
      resave: false,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000, //30 days
        secure: __prod__,
        httpOnly: false,
        sameSite: __prod__ ? 'none' : 'lax',
      },
      saveUninitialized: true,
    }),
  );

  app.use(function (req, res, next) {
    res.set('credentials', 'include');
    res.set('Access-Control-Allow-Credentials', 'true');
    res.set('Access-Control-Allow-Origin', req.headers.origin);
    res.set('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.set(
      'Access-Control-Allow-Headers',
      'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Set-Cookie',
    );
    next();
  });

  var corsOptions = {
    origin: [process.env.CORS_ORIGIN, 'https://studio.apollographql.com'],
    optionsSuccessStatus: 200, // For legacy browser support
    credentials: true,
  };
  app.use(cors(corsOptions));

  console.info(__dirname + '/uploads/images');
  app.use('/uploads', express.static(__dirname + '/uploads/images'));

  const s3 = new aws.S3({
    credentials: {
      accessKeyId: process.env.AWS_ID,
      secretAccessKey: process.env.AWS_SECRET,
    },
  });

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({
      req,
      res,
      s3,
    }),
    introspection: true, //!__prod__,
    plugins: [
      ApolloServerPluginLandingPageGraphQLPlayground(),
      // __prod__
      //   ? ApolloServerPluginLandingPageDisabled()
      //   : ApolloServerPluginLandingPageGraphQLPlayground(),
    ],
  });

  app.use(graphqlUploadExpress({ maxFiles: 10 }));
  await apolloServer.start();

  apolloServer.applyMiddleware({ app, cors: false, path: '/data' });

  app.get('/healthz', function (_, res) {
    res.status(200).send('OK');
  });

  app.get('/spacex', async (_, res) => {
    fetch('https://api.spacexdata.com/v3/launches')
      .then((data) => data.json())
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        res.status(500).send(err.message);
      });
  });

  app.listen({ port: process.env.PORT });

  console.log(`Starting as prod: ${__prod__}`);
  console.log(
    `???? Server ready at http://localhost:4000${apolloServer.graphqlPath}`,
  );
  // await new Promise((r) => app.listen({ port: process.env.PORT }, r));
};

main().catch((err) => {
  console.error(err);
});
