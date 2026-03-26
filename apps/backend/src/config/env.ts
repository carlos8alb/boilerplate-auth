import dotenv from "dotenv";

dotenv.config();

export const config = {
  jwt: {
    secret: process.env.JWT_SECRET || "your-secret-key",
    expiresIn: process.env.JWT_EXPIRY || "15m",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "your-refresh-secret",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRY || "7d",
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY || "",
  },
  port: parseInt(process.env.PORT || "3000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
};
