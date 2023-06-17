import crypto from "crypto";
import mongoose, { Document } from "mongoose";
import { IUser } from "../entities/User";

export interface IUserDocument extends Document {
  fullName: IUser["fullName"];
  email: IUser["email"];
  phoneNumber: IUser["phoneNumber"];
  password: IUser["password"];
  salt: IUser["salt"];
  dob?: IUser["dob"];
  age?: IUser["age"];
  lastLogin: string;
  authenticate: (password: string) => boolean;
}

const userSchema = new mongoose.Schema<IUserDocument>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    phoneNumber: {
      type: Number,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    salt: {
      type: String,
      required: true,
    },
    dob: {
      type: String,
    },
    age: {
      type: Number,
    },
    lastLogin: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.methods = {
  /**
   *
   * @param password
   * @returns req.body.password === password in DB
   */
  authenticate: function (password): boolean {
    const encryptedPassword = crypto
      .pbkdf2Sync(password, this.salt, 2809, 64, `sha512`)
      .toString("hex");
    return encryptedPassword === this.password;
  },
};

const User = mongoose.model<IUser>("User", userSchema);

export default User;
