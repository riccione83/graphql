import { Request, Response } from 'express';
import { S3 } from 'aws-sdk';

export type MyContext = {
  req: Request;
  res: Response;
  s3: S3;
  // userLoader: ReturnType<typeof createUserLoader>;
};

declare module 'express-session' {
  export interface SessionData {
    [key: string]: any;
  }
}
