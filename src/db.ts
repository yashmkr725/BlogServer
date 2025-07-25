import mongoose, { Schema, model } from "mongoose";

const UserSchema = new Schema({
  username: { type: String, require: true, unique: true },
  email: { type: String, require: true, unique: true },
  password: { type: String, require: true },
});

const BlogSchema = new Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", require: true },
  body: { type: String },
  tags: [{ type: String }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
});

export const User = model("User", UserSchema);
export const Blog = model("Blog",BlogSchema)