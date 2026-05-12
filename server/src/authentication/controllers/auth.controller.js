import signupService from "../services/signup.service.js";

export const signupController = async (req, res, next) => {
  try {
    const { statusCode, ...response } = await signupService(req.body);

    return res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

export default { signupController };
