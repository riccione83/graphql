import { Request, Response } from 'express';

export type MyContext = {
  req: Request;
  res: Response;
  // userLoader: ReturnType<typeof createUserLoader>;
};

declare module 'express-session' {
  export interface SessionData {
    [key: string]: any;
  }
}
