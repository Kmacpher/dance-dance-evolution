import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import User, { IUser } from '../db/models/User';

export function configurePassport() {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user || !(await user.correctPassword(password))) {
          return done(null, false, { message: 'Invalid credentials' });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user, done) => done(null, (user as IUser).id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await User.findById(id);
      done(null, user ?? false);
    } catch (err) {
      done(err);
    }
  });
}

const router = Router();

router.post('/login', (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('local', (err: Error, user: IUser | false) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    req.logIn(user, (loginErr) => {
      if (loginErr) return next(loginErr);
      res.json({ id: user.id, email: user.email, username: user.username });
    });
  })(req, res, next);
});

router.post('/signup', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, username, password } = req.body as {
      email: string; username: string; password: string;
    };
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already in use' });

    const user = await User.create({ email, username, password });
    req.logIn(user, (err) => {
      if (err) return next(err);
      res.status(201).json({ id: user.id, email: user.email, username: user.username });
    });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (req: Request, res: Response, next: NextFunction) => {
  req.logout((err) => {
    if (err) return next(err);
    res.json({ ok: true });
  });
});

router.get('/session', (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    const user = req.user as IUser;
    res.json({ id: user.id, email: user.email, username: user.username });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

export default router;
