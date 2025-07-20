const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Product = require("../models/Product");
require("dotenv").config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected for seeding");
  } catch (error) {
    console.error("Database connection error:", error.message);
    process.exit(1);
  }
};

const seedProducts = async () => {
  try {
    // Read the JSON file
    const jsonFilePath = path.join(__dirname, "./products.json");
    const jsonData = fs.readFileSync(jsonFilePath, "utf8");
    const productsData = JSON.parse(jsonData);

    console.log(`Found ${productsData.length} products to seed`);

    // Clear existing products (optional)
    console.log("Clearing existing products...");
    await Product.deleteMany({});

    // Transform the data to match your Product schema
    const transformedProducts = productsData.map(product => ({
      name: product.title,
      price: Math.round(product.price * 83), // Convert USD to INR (approximate)
      image: product.image,
      description: product.description,
      stock: Math.floor(Math.random() * 100) + 10, // Random stock between 10-110
      category: product.category,
      rating: product.rating?.rate || 0,
      ratingCount: product.rating?.count || 0,
      originalId: product.id
    }));

    // Insert products in batches to avoid memory issues
    const batchSize = 50;
    for (let i = 0; i < transformedProducts.length; i += batchSize) {
      const batch = transformedProducts.slice(i, i + batchSize);
      await Product.insertMany(batch);
      console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(transformedProducts.length / batchSize)}`);
    }

    console.log(`Successfully seeded ${transformedProducts.length} products!`);
  } catch (error) {
    console.error("Error seeding products:", error.message);
  }
};

const runSeeder = async () => {
  await connectDB();
  await seedProducts();
  await mongoose.connection.close();
  console.log("Database connection closed. Seeding complete!");
};

runSeeder();