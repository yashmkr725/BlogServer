import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { StatusCodes } from '../statusCodes';

export const authMiddleWare: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Auth')?.replace('Bearer ', '');
    if (!token) {
      return res.status(StatusCodes.UnAuthorized).json({
        msg: 'No token provided',
      });
    }

    const decode = jwt.verify(token, process.env.SECRET!);
    if (
      typeof decode === 'object' &&
      decode !== null &&
      'id' in decode &&
      typeof decode.id === 'string'
    ) {
      req.userId = decode.id;
      next();
    }
  } catch (err) {
    return res.status(StatusCodes.UnAuthorized).json({
      msg: 'Unauthorized',
      err,
    });
  }
};
