import { Request, Response, Router } from 'express';
import { StatusCodes } from '../statusCodes';
import { z } from 'zod';
import { User } from '../db';
const authRouter: Router = Router();

const signupSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 character').trim(), // trim removes extra spaces
  email: z.email('Invalid email').trim(),
  password: z
    .string()
    .min(3)
    .regex(/[A-Z]/, 'Password must contain an uppercase')
    .regex(/[a-z]/, 'Password must contain a lower case')
    .regex(/[0-9]/, 'Password must contain a digit')
    .trim(),
});

type signupData = z.infer<typeof signupSchema>;

authRouter.post('/signup', async (req: Request, res: Response) => {
  const parsedBody = signupSchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(StatusCodes.InvalidRequestData).json({
      msg: 'Invalid Input Data',
      err: z.treeifyError(parsedBody.error), // parseBody.error.format() is depreciated
      // this gives a tree like a format
    });
  }

  const { username, password, email }: signupData = parsedBody.data;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(StatusCodes.Conflict).json({
      msg: 'User already existed',
    });
  }

  try {
    await User.create({
      username,
      email,
      password,
    });
    return res.status(StatusCodes.SuccessSignup).json({
      msg: 'Signup Successfull',
    });
  } catch (e) {
    const error = e;
    return res.status(StatusCodes.DBfaliure).json({
      msg: 'Signup Error',
      error,
    });
  }
});

export default authRouter;
