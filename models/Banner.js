const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    imageUrl: { type: String, required: true },
    linkUrl: { type: String },
    buttonText: { type: String },
    position: {
      type: String,
      enum: ['HOME_HERO', 'HOME_PROMO', 'CATEGORY', 'SIDEBAR'],
      default: 'HOME_HERO',
    },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    startDate: { type: Date },
    endDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Banner', bannerSchema);
