import crypto from "crypto";

export interface IUser {
  fullName: String;
  email: String;
  phoneNumber: number;
  password: String;
  salt?: String;
  dob?: String;
  age?: number;
}

export default class User {
  private fullName: String;
  private email: String;
  private phoneNumber: number;
  private password: String;
  private dob: String;
  private age: number;
  private salt: string;

  /**
   *
   * @param fullName
   * @param email
   * @param phoneNumber
   * @param password
   * @param dob
   */
  constructor(fullName, email, phoneNumber, password, dob?) {
    this.fullName = fullName;
    this.email = email;
    this.phoneNumber = phoneNumber;
    this.password = this.encryptUserPassword(password);
    this.dob = dob;
    if (dob) this.age = new Date().getFullYear() - new Date(dob).getFullYear();
  }

  /**
   *
   * @returns User
   */
  public getUser(): IUser {
    return {
      fullName: this.fullName,
      email: this.email,
      phoneNumber: this.phoneNumber,
      password: this.password,
      dob: this.dob,
      age: this.age,
      salt: this.salt,
    };
  }

  /**
   *
   * @param password
   * @returns encryptedPassword
   */
  private encryptUserPassword(password: string): string {
    this.salt = crypto.randomBytes(16).toString("hex");
    const encryptedPassword = crypto
      .pbkdf2Sync(password, this.salt, 2809, 64, `sha512`)
      .toString("hex");
    return encryptedPassword;
  }
}
