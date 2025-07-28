import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import authRouter from './routes/auth';
import mongoose from 'mongoose';
import { authMiddleWare } from './middleware/auth';

dotenv.config();
const app: Application = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use('/auth', authRouter);

app.get('/', (req: Request, res: Response) => {
  res.json({
    msg: 'This is the default route',
  });
});

app.get('/private', authMiddleWare, (req: Request, res: Response) => {
  const id = req.userId;
  res.send(id);
});

const StartDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('Connected to the database');
  } catch (e) {
    console.log(e);
  }
};

const StartServer = async () => {
  await StartDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server is started on http://localhost:${PORT}`);
    });
  });
};

StartServer().catch((err) => {
  console.log('Failed to start the server ', err);
});
