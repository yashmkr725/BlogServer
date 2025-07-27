import { Request, Response, Router } from 'express';
import { StatusCodes } from '../statusCodes';
import { z } from 'zod';
import { User } from '../db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const authRouter: Router = Router();

const signupSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 character').trim(), // trim removes extra spaces
  email: z.email('Invalid email').trim(),
  password: z
    .string()
    .min(6)
    .regex(/[A-Z]/, 'Password must contain an uppercase')
    .regex(/[a-z]/, 'Password must contain a lower case')
    .regex(/[0-9]/, 'Password must contain a digit')
    .trim(),
});
const signinSchema = signupSchema.pick({
  email: true,
  password: true,
});

type signupData = z.infer<typeof signupSchema>;
type signinData = z.infer<typeof signinSchema>;

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
    const emailNormalize = email.toLowerCase();
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      username,
      email: emailNormalize,
      hashedPassword,
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

authRouter.post('/signin', async (req: Request, res: Response) => {
  const parseBody = signinSchema.safeParse(req.body);
  if (!parseBody.success) {
    return res.status(StatusCodes.InvalidRequestData).json({
      msg: 'Invalid input data',
      err: z.treeifyError(parseBody.error),
    });
  }

  const { email, password }: signinData = parseBody.data;
  const emailNormalize = email.toLowerCase();

  try {
    const user = await User.findOne({ email: emailNormalize });
    if (!user) {
      return res.status(StatusCodes.UnAuthorized).json({
        msg: 'Invalid Credentials',
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.hashedPassword!); // user.password! it tells it is not undefined or null
    if (!isPasswordMatch) {
      return res.status(StatusCodes.UnAuthorized).json({
        msg: 'Invalid Credentials',
      });
    }
    const token = jwt.sign({ id: user._id }, process.env.SECRET!);

    res.status(StatusCodes.Success).json({
      msg: 'Signin successful',
      token,
    });
  } catch (err) {
    console.log(err);
    return res.status(StatusCodes.DBfaliure).json({
      msg: 'Signin Failed',
    });
  }
});

export default authRouter;
