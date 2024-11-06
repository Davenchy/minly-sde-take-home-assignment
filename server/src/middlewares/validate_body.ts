import type { Request, Response, NextFunction } from "express"
import type { ZodSchema, ZodError } from "zod"

type FieldErrors<T> = {
  [key in keyof T]?: string
}

const formattedZodFieldErrors = <T>(error: ZodError<T>): FieldErrors<T> => {
  const fieldErrors = error.formErrors.fieldErrors
  return (Object.keys(fieldErrors) as (keyof T)[]).reduce(
    (acc, key) => {
      acc[key] = (fieldErrors[key] as string[])[0]
      return acc
    },
    {} as FieldErrors<T>,
  )
}

export const ValidateBody =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)

    if (result.success) {
      req.body = result.data
      return next()
    }

    res.status(400).json({
      message: "invalid body",
      errors: formattedZodFieldErrors(result.error),
    })
  }
