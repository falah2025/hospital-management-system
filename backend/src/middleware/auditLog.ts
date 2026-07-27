import { Request, Response, NextFunction } from "express";
import { prisma } from "../server";

export const auditLog = (action: string, resource: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const originalSend = res.send.bind(res);

    res.send = function (body: any) {
      // Log after response is sent
      if (req.user) {
        prisma.auditLog.create({
          data: {
            userId: req.user.userId,
            action,
            resource,
            recordId: req.params.id || undefined,
            ipAddress: req.ip || undefined,
            userAgent: req.headers["user-agent"] || undefined,
            oldValue: req.method === "PUT" || req.method === "PATCH" ? req.body : undefined,
            newValue: body,
          },
        }).catch(console.error);
      }
      return originalSend(body);
    };

    next();
  };
};
