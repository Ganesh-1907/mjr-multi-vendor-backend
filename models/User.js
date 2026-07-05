const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    avatar: { type: String },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
    },
    isActive: { type: Boolean, default: true },
    emailVerified: { type: Boolean, default: false },
    verificationOtp: { type: String },
    otpExpiry: { type: Date },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.verificationOtp;
  delete obj.otpExpiry;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
