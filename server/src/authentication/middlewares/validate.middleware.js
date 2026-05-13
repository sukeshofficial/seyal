export const validate = (schema) => {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);

      next();
    } catch (error) {
      const formattedErrors = {};

      error.issues?.forEach((issue) => {
        const field = issue.path.join(".");

        if (!formattedErrors[field]) {
          formattedErrors[field] = [];
        }

        formattedErrors[field].push(issue.message);
      });

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: formattedErrors,
      });
    }
  };
};
