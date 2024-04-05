const express = require("express");
const cors = require("cors");
const User = require("./models/userModel");
const myuser = require("./models/myuser.js");
const routes = require("./Routes/userRoutes.js");
const {mongoDB} = require("./mongoDB.js");
const morgan = require("morgan");

const app = express();
const port = process.env.PORT || 5000; 

// Middleware
app.use(cors());
app.use(morgan("tiny"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.disable("x-powered-by"); 

// Routes
app.use("/api/", routes);
app.use("/api/",require("./Routes/DisplayData.js"));
app.use("/api/",require("./Routes/OrderData.js"));
app.get("/",(req,res)=>{
  res.send("Hello World");
})
// Connect to MongoDB database


// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
