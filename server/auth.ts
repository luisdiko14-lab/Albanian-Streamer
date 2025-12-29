import { Strategy as DiscordStrategy, Profile } from 'passport-discord';
import passport from 'passport';
import type { Express } from 'express';
import session from 'express-session';
import { storage } from './storage';
import { User } from '@shared/schema';

declare global {
  namespace Express {
    interface User extends User {}
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'albanian-tv-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
  };

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID!,
    clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    callbackURL: 'https://e6e65b1a-ec3e-4f1c-bc9d-868e0c8ca8b2-00-vjefb4mg4eur.janeway.replit.dev/api/callback',
    scope: ['identify', 'email']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await storage.getUser(profile.id);
      if (!user) {
        user = await storage.createUser({
          id: profile.id,
          username: profile.username,
          email: profile.email!,
          avatar: profile.avatar
        });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));

  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.get('/api/auth/login', passport.authenticate('discord'));
  
  app.get('/api/callback', 
    passport.authenticate('discord', { failureRedirect: '/login' }),
    (req, res) => res.redirect('/validator')
  );

  app.get('/api/me', (req, res) => {
    res.json(req.user || null);
  });

  app.post('/api/auth/logout', (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });
}
