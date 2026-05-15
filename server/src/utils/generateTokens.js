import jwt from "jsonwebtoken";
import jwtConfig from "../config/jwt.config.js";

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      providers: user.providers || [],
      tv: user.tokenVersion ?? 0, // Token version — used to revoke sessions on logout
    },
    jwtConfig.access.secret,
    {
      expiresIn: jwtConfig.access.expiresIn,
    },
  );

  const refreshToken = jwt.sign(
    {
      sub: user._id.toString(),
    },
    jwtConfig.refresh.secret,
    {
      expiresIn: jwtConfig.refresh.expiresIn,
    },
  );

  return {
    accessToken,
    refreshToken,
  };
};

export default generateTokens;
