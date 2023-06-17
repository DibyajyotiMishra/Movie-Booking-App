import { Session } from "express-session";
import User from "../entities/User";

interface IUserData {
  fullName: User["fullName"];
  email: User["email"];
  phoneNumber: User["phoneNumber"];
  age?: User["age"];
}

export default interface ISession extends Session {
  user: IUserData;
}
