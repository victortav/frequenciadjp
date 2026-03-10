import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";

const PostgresStore = connectPgSimple(session);

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Session setup
  app.use(
    session({
      store: new PostgresStore({ pool, createTableIfMissing: true }),
      secret: process.env.SESSION_SECRET || "frequenciadjp-secret",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production" },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!googleClientId || !googleClientSecret) {
    console.error("WARNING: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is not set. Google Login will not work.");
  } else {
    passport.use(
      new GoogleStrategy(
        {
          clientID: googleClientId,
          clientSecret: googleClientSecret,
          callbackURL: "/api/auth/google/callback",
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const user = await storage.createOrUpdateUser({
              googleId: profile.id,
              email: profile.emails?.[0]?.value || "",
              displayName: profile.displayName,
              picture: profile.photos?.[0]?.value || null,
            });
            return done(null, user);
          } catch (err) {
            return done(err);
          }
        }
      )
    );
  }

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Auth routes
  app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

  app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    (_req, res) => {
      res.redirect("/");
    }
  );

  app.get(api.auth.me.path, (req, res) => {
    res.json(req.user || null);
  });

  app.post(api.auth.logout.path, (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ success: true });
    });
  });

  // Protected routes middleware
  const isAuthenticated = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ message: "Unauthorized" });
  };

  app.get(api.churches.list.path, async (req, res) => {
    const data = await storage.getChurches();
    res.json(data);
  });

  app.get(api.attendances.list.path, isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const data = await storage.getAttendances(user.id);
    res.json(data);
  });

  app.post(api.attendances.create.path, isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const bodySchema = api.attendances.create.input.extend({
        igrejaId: z.coerce.number(),
        adultos: z.coerce.number(),
        criancas: z.coerce.number(),
        convidados: z.coerce.number(),
        veiculos: z.coerce.number(),
      });
      const input = bodySchema.parse(req.body);
      const data = await storage.createAttendance({
        ...input,
        userId: user.id,
      });
      res.status(201).json(data);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  return httpServer;
}