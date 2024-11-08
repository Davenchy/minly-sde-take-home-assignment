import {
  PASSWORD_SALT_ROUNDS,
} from "@/config"
import bcrypt from "bcrypt"
import { Schema, model } from "mongoose"
import type { HydratedDocument } from "mongoose"
import { z } from "zod"

// Types //
export type UserRegisteration = z.infer<typeof UserRegisterationSchema>
export type UserCredentials = z.infer<typeof UserCredentialsSchema>
export type RefreshToken = z.infer<typeof RefreshTokenSchema>

interface IUserMethods {
  validatePassword(password: string): Promise<boolean>
}

export type IUser = UserRegisteration & IUserMethods
export type UserDocument = HydratedDocument<IUser>

// Schemas //
export const UserCredentialsSchema = z.object({
  email: z
    .string({ message: "email is required" })
    .email("invalid email address"),
  password: z
    .string({ message: "password is required" })
    .min(8, "password must be at lease 8 characters long"),
})

export const UserRegisterationSchema = UserCredentialsSchema.extend({
  username: z
    .string({ message: "username is required" })
    .min(3, "username must be at least 3 characters long"),
})

export const RefreshTokenSchema = z.object({
  refreshToken: z.string({ message: "refresh token is required" }),
})

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, minlength: 3 },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 8 },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform(doc, ret) {
        // ret.id = doc._id
        // biome-ignore lint/performance/noDelete: <explanation>
        ret
      },
    },
    methods: {
      async validatePassword(password: string): Promise<boolean> {
        return await bcrypt.compare(password, this.password)
      },
    },
  },
)

// hash user's password before saving
userSchema.pre("save", async function () {
  const hashedPassword = await bcrypt.hash(this.password, PASSWORD_SALT_ROUNDS)
  this.password = hashedPassword
})

// Model //
const User = model<IUser>("User", userSchema)
export default User
