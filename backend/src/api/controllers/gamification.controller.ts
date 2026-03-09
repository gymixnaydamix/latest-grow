import type { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '../../utils/errors.js';
import { gamificationService } from '../services/gamification.service.js';

function actor(req: Request) {
  return req.user?.email ?? 'operator@growyourneed.dev';
}

function pageId(req: Request) {
  return typeof req.params.pageId === 'string' ? req.params.pageId : '';
}

export const gamificationController = {
  getBootstrap(_req: Request, res: Response) {
    res.json({ success: true, data: gamificationService.getBootstrap() });
  },

  getPage(req: Request, res: Response, next: NextFunction) {
    try {
      const data = gamificationService.getPage(pageId(req), {
        search: typeof req.query.search === 'string' ? req.query.search : undefined,
        range: typeof req.query.range === 'string' ? req.query.range : undefined,
        segment: typeof req.query.segment === 'string' ? req.query.segment : undefined,
      });
      if (!data) {
        return next(new NotFoundError('Gamification page not found'));
      }
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  saveDraft(req: Request, res: Response, next: NextFunction) {
    try {
      const data = gamificationService.saveDraft(pageId(req), req.body, actor(req));
      if (!data) {
        return next(new NotFoundError('Gamification page not found'));
      }
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  publish(req: Request, res: Response, next: NextFunction) {
    try {
      const data = gamificationService.publish(pageId(req), actor(req));
      if (!data) {
        return next(new NotFoundError('Gamification page not found'));
      }
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  rollback(req: Request, res: Response, next: NextFunction) {
    try {
      const data = gamificationService.rollback(pageId(req), req.body.versionId, actor(req));
      if (!data) {
        return next(new NotFoundError('Gamification page not found'));
      }
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  export(req: Request, res: Response, next: NextFunction) {
    try {
      const data = gamificationService.export(pageId(req), actor(req));
      if (!data) {
        return next(new NotFoundError('Gamification page not found'));
      }
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  runAction(req: Request, res: Response, next: NextFunction) {
    try {
      const data = gamificationService.runAction(pageId(req), req.body.cardId, req.body.action, actor(req));
      if (!data) {
        return next(new NotFoundError('Gamification page not found'));
      }
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },
};
