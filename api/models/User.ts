import crypto from "crypto";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
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
      type: Date,
    },
  },
  { timestamps: true }
);

userSchema.methods = {
  authenticate: function (password): boolean {
    const encryptedPassword = crypto
      .pbkdf2Sync(password, this.salt, 2809, 64, `sha-512`)
      .toString("hex");
    return encryptedPassword === this.password;
  },
};

const User = mongoose.model("User", userSchema);

export default User;
