import { ROLES } from '../config/constants.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { signToken } from '../utils/jwt.js';

export async function registerCustomer({ name, email, password }) {
  if (await User.exists({ email })) throw new ApiError(409, 'An account with this email already exists');
  try {
    const user = await User.create({ name, email, password, role: ROLES.CUSTOMER });
    return { user, token: signToken(user) };
  } catch (err) {
    // Unique index is the real guard against concurrent duplicate registrations.
    if (err.code === 11000) throw new ApiError(409, 'An account with this email already exists');
    throw err;
  }
}

export async function login({ email, password }) {
  const user = await User.findOne({ email }).select('+password');
  // Same message for unknown email and wrong password: avoids account enumeration.
  if (!user || !(await user.comparePassword(password))) throw new ApiError(401, 'Invalid email or password');
  return { user, token: signToken(user) };
}
