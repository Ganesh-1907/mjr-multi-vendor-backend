const slugifyLib = require('slugify');

const generateUniqueSlug = async (text, model, existingId = null) => {
  let slug = slugifyLib(text, { lower: true, strict: true });
  let counter = 0;
  let uniqueSlug = slug;

  while (true) {
    const query = { slug: uniqueSlug };
    if (existingId) {
      query._id = { $ne: existingId };
    }
    const existing = await model.findOne(query);
    if (!existing) break;
    counter++;
    uniqueSlug = `${slug}-${counter}`;
  }

  return uniqueSlug;
};

module.exports = { generateUniqueSlug };
