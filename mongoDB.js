const mongoose = require('mongoose');
const mongoURI = "mongodb+srv://Shubham_234:123456skT@cluster0.ld2mebh.mongodb.net/Hackathon";

async function mongoDB() {
    try {
        await mongoose.connect(mongoURI);
        console.log("Connected to MongoDB");
        await fetched_data(); // Await the fetched_data function call
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

module.exports = mongoDB(); // Export the function without calling it

async function fetched_data() {
    try {
        const fetchedData = await mongoose.connection.db.collection("foodItem");
        const foodCategory = await mongoose.connection.db.collection("foodCategory");
        
        const data = await fetchedData.find({}).toArray();
        const catData = await foodCategory.find({}).toArray();
        
        global.foodItem = data;
        global.foodCategory = catData;
    } catch (err) {
        console.log(err);
    }
}

require("./models/myuser.js"); // Import the necessary models
