require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');
const ProductImage = require('../models/ProductImage');
const ProductVariant = require('../models/ProductVariant');
const Banner = require('../models/Banner');

const catImages = {
  'electronics': 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=400',
  'fashion': 'https://images.pexels.com/photos/2983464/pexels-photo-2983464.jpeg?auto=compress&cs=tinysrgb&w=400',
  'home-kitchen': 'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=400',
  'sports-fitness': 'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=400',
  'books': 'https://images.pexels.com/photos/46274/pexels-photo-46274.jpeg?auto=compress&cs=tinysrgb&w=400',
  'beauty-personal-care': 'https://images.pexels.com/photos/312839/pexels-photo-312839.jpeg?auto=compress&cs=tinysrgb&w=400',
  'toys-games': 'https://images.pexels.com/photos/255514/pexels-photo-255514.jpeg?auto=compress&cs=tinysrgb&w=400',
  'automotive': 'https://images.pexels.com/photos/120049/pexels-photo-120049.jpeg?auto=compress&cs=tinysrgb&w=400',
};

const imgMap = {
  'iphone': 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=800',
  'samsung': 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=800',
  'macbook': 'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800',
  'sony': 'https://images.pexels.com/photos/3394665/pexels-photo-3394665.jpeg?auto=compress&cs=tinysrgb&w=800',
  'tshirt': 'https://images.pexels.com/photos/428338/pexels-photo-428338.jpeg?auto=compress&cs=tinysrgb&w=800',
  'kurti': 'https://images.pexels.com/photos/1055691/pexels-photo-1055691.jpeg?auto=compress&cs=tinysrgb&w=800',
  'cookware': 'https://images.pexels.com/photos/8786961/pexels-photo-8786961.jpeg?auto=compress&cs=tinysrgb&w=800',
  'chair': 'https://images.pexels.com/photos/1957477/pexels-photo-1957477.jpeg?auto=compress&cs=tinysrgb&w=800',
  'yoga': 'https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg?auto=compress&cs=tinysrgb&w=800',
  'dumbbell': 'https://images.pexels.com/photos/3928519/pexels-photo-3928519.jpeg?auto=compress&cs=tinysrgb&w=800',
  'books': 'https://images.pexels.com/photos/159866/books-book-pages-read-literature-159866.jpeg?auto=compress&cs=tinysrgb&w=800',
  'skincare': 'https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=800',
};

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecommerce');
  console.log('Connected');

  // Fix categories
  for (const cat of await Category.find()) {
    if (catImages[cat.slug]) {
      cat.image = catImages[cat.slug];
      await cat.save();
    }
  }

  // Fix variants
  for (const v of await ProductVariant.find()) {
    if (v.image && v.image.includes('picsum.photos')) {
      const matchKey = Object.keys(imgMap).find(k => v.image.includes(k));
      if (matchKey) {
        v.image = imgMap[matchKey];
        await v.save();
        console.log(`Updated variant ${v.sku}`);
      }
    }
  }

  // Fix product images
  for (const pi of await ProductImage.find()) {
    if (pi.url && pi.url.includes('picsum.photos')) {
      const matchKey = Object.keys(imgMap).find(k => pi.url.includes(k));
      if (matchKey) {
        pi.url = imgMap[matchKey];
        await pi.save();
        console.log(`Updated product image ${pi._id}`);
      }
    }
  }

  // Fix banners
  const banners = await Banner.find();
  for (const b of banners) {
    if (b.imageUrl && b.imageUrl.includes('picsum.photos')) {
      if (b.title.includes('Mega Sale')) b.imageUrl = 'https://images.pexels.com/photos/5632398/pexels-photo-5632398.jpeg?auto=compress&cs=tinysrgb&w=1200';
      if (b.title.includes('Fashion Fest')) b.imageUrl = 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=1200';
      if (b.title.includes('Fitness Frenzy')) b.imageUrl = 'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=1200';
      await b.save();
      console.log('Updated banner', b.title);
    }
  }

  process.exit(0);
}

run();
