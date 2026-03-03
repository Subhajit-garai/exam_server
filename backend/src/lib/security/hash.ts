import bcrypt from "bcrypt";
import crypto from "crypto";

export const hashPasswordFn = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};
export const veryfyhashPasswordFn = async (
  password: string,
  hashPassword: string
): Promise<boolean> => {
  return bcrypt.compareSync(password, hashPassword);
};

export const Createhash = (token: string) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};


export const generateResetToken = (uniqueIdentifyer?: string) => {
  let token = crypto.randomBytes(32).toString("hex"); // Generate a random token
  token = uniqueIdentifyer ? `${token}.${uniqueIdentifyer}` : token;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex"); // Hash

  return { token, hashedToken };
};
