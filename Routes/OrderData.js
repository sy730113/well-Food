const express = require("express");
const router = express.Router();
const Order = require("../models/Orders"); // Correct path to the Order model file

router.post("/orderData", async (req, res) => {
  let data = req.body.order_data;
  await data.splice(0, 0, { order_data: req.body.order_data });
  try {
    let uName = await Order.findOne({ userName: req.body.userName });

    if (uName === null) {
      await Order.create({
        userName: req.body.userName,
        order_data: [data],
      });
      res.json({ success: true });
    } else {
      await Order.findOneAndUpdate(
        { userName: req.body.userName },
        { $push: { order_data: data } }
      );
      res.json({ success: true });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server error: " + error.message);
  }
});

module.exports = router;
