import * as crypto from "crypto";

export default class Crypto {
  private static algorithm: crypto.CipherGCMTypes = "aes-256-gcm";
  private static iterations: number = 2500;
  private static keylength: number = 32;
  private static digest = "sha512";
  private static salt: Buffer = crypto.randomBytes(64);

  public static encrypt(data: string, secretKey: string): string {
    const inputEncoding = "utf-8";
    const outputEncoding = "base64";

    const iv = crypto.randomBytes(12);

    const key: Buffer = crypto.pbkdf2Sync(
      secretKey,
      Crypto.salt,
      Crypto.iterations,
      Crypto.keylength,
      Crypto.digest
    );

    const cipher = crypto.createCipheriv(Crypto.algorithm, key, iv);

    const enc1 = cipher.update(data, inputEncoding);
    const enc2 = cipher.final();

    const tag = cipher.getAuthTag();

    const encryptedData = Buffer.concat([enc1, enc2, iv, tag]).toString(
      outputEncoding
    );

    return encryptedData;
  }

  public static decrypt(data: string, secretKey: string): string {
    const inputEncoding = "base64";
    const outputEncoding = "utf-8";

    const bufferData = Buffer.from(data, inputEncoding);

    const key = crypto.pbkdf2Sync(
      secretKey,
      Crypto.salt,
      Crypto.iterations,
      Crypto.keylength,
      Crypto.digest
    );

    const iv = bufferData.subarray(
      bufferData.length - 28,
      bufferData.length - 16
    );

    const tag = bufferData.subarray(bufferData.length - 16);

    const enctext = bufferData.subarray(0, bufferData.length - 28);

    const decipher = crypto.createDecipheriv(Crypto.algorithm, key, iv);

    decipher.setAuthTag(tag);

    let decryptedData = decipher.update(enctext, null, outputEncoding);
    decryptedData += decipher.final(outputEncoding);

    return decryptedData;
  }
}
