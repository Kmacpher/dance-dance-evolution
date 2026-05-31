import path from 'path';
import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import apiRouter from './routes';
import authRouter, { configurePassport } from './routes/auth';

configurePassport();

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(
    session({
      secret: process.env.SESSION_SECRET ?? 'dev-secret',
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/dde',
      }),
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  // Static assets from the original browser/ directory
  app.use('/audio', express.static(path.join(process.cwd(), 'browser', 'audio')));
  app.use('/img', express.static(path.join(process.cwd(), 'browser', 'img')));
  app.use('/video', express.static(path.join(process.cwd(), 'browser', 'video')));
  app.use('/sm', express.static(path.join(process.cwd(), 'browser', 'sm')));

  app.use('/auth', authRouter);
  app.use('/api', apiRouter);

  // Serve built React app in production
  if (process.env.NODE_ENV === 'production') {
    const staticPath = path.join(process.cwd(), 'server', 'public');
    app.use(express.static(staticPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(staticPath, 'index.html'));
    });
  }

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: err.message ?? 'Internal server error' });
  });

  return app;
}
