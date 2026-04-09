import { randomBytes } from "crypto"

/** Senha temporária forte o suficiente para políticas comuns do Supabase Auth. */
export function generateTemporaryPassword(): string {
  const lower = "abcdefghjkmnpqrstuvwxyz"
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ"
  const digits = "23456789"
  const special = "@#$%&*"
  const all = lower + upper + digits + special

  const buf = randomBytes(20)
  let out = ""
  out += lower[buf[0]! % lower.length]!
  out += upper[buf[1]! % upper.length]!
  out += digits[buf[2]! % digits.length]!
  out += special[buf[3]! % special.length]!
  for (let i = 4; i < 16; i++) {
    out += all[buf[i]! % all.length]!
  }
  return out
}
