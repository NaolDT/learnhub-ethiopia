import AppError from "../utils/AppError.js";

export default function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body ?? {});

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      const message = details.map((detail) => detail.message).join(". ");
      throw new AppError(message, 400, details);
    }

    req.body = result.data;
    next();
  };
}