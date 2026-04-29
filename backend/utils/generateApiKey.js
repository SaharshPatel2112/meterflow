import crypto from "crypto";

export const generateApiKey = () => {
  const prefix = "mf";
  const secret = crypto.randomBytes(32).toString("hex");
  return `${prefix}_${secret}`;
};
