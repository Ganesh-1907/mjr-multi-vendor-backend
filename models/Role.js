const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      enum: ['CUSTOMER', 'VENDOR', 'ADMIN'],
    },
    description: { type: String },
    permissions: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Role', roleSchema);
