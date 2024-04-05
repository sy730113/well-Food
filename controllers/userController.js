const user = require("../models/userModel.js");
const myuser=require("../models/myuser.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwtSecret="4d6fdc3b4b72439f8f8a489b97202be4";
const ENV = require("../config.js");
const otpGenerator = require("otp-generator");
const { body, validationResult } = require('express-validator');
const saltOrRounds = 10;

// middleware for verify user

async function verifyUser(req, res, next) {
  try {
    const { username } = req.method == "GET" ? req.query : req.body;
    //check the user existence in the database...
    const existUser = await user.findOne({ username });

    if (!existUser) return res.status(404).send({ error: "User not found" });
    next();
  } catch (error) {
    return res.status(404).send({
      error: "Authentication error",
    });
  }
}

async function handleregister(req, res) {
  try {
    const { username, password, email } = req.body;

    // Check if all required fields are provided
    if (!username || !password || !email) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const existUser = await user.findOne({ email });

    // Create a new user instance
    if (!existUser) {
      const hashedPassword = await bcrypt.hash(password, saltOrRounds);
      const newUser = new user({
        username,
        password: hashedPassword,
        email,
      });

      await newUser.save();
    } else {
      res.status(400).json({
        msg: "User already exists",
      });
    }

    res.status(201).json({
      msg: "User created successfully",
    });
  } catch (err) {
    console.error("Error in registration:", err);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

async function handleauthenticate(req, res) {}
async function handleregisterMail(req, res) {}

async function handlelogin(req, res) {
  try {
    const { username, password } = req.body;

    // Check if all required fields are provided
    if (!username || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existuser = await user.findOne({ username });

    if (!existuser) {
      return res.status(400).json({ msg: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(password, existuser.password);

    if (passwordMatch) {
      // Create JWT token
      const authToken = jwt.sign(
        {
          username: existuser.username,
          userId: existuser.user_id,
          PASSWORD: existuser.password,
          EMAIL: existuser.email,
        },
        ENV,
        { expiresIn: "24h" }
      );

      // Send token in response
      return res.status(200).json({
        msg: "login Successfully",
        authToken,
        username: existuser.username,
      });
    } else {
      return res.status(400).json({ msg: "Password incorrect" });
    }
  } catch (error) {
    // Log the error for debugging
    console.error("Error in registration:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// get routes handler

async function handleuserName(req, res) {
  try {
    const { username } = req.params;
    const result = await user.findOne({ username });
    if (!result) {
      return res.status(400).json({ msg: "User not found" });
    } else {
      const responseData = {
        username: result.username,
        userId: result._id,
        email: result.email,
        profile: result.profile,
      };

      return res.status(200).json(responseData);
    }
  } catch (error) {
    // Log the error for debugging
    console.error("Error in registration:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function handlegenerateOTP(req, res) {
  req.app.locals.OTP = await otpGenerator.generate(4, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
  res.status(201).send({ code: req.app.locals.OTP });
}

async function handleverifyOTP(req, res) {
  const { code } = req.query;
  if (parseInt(req.app.locals.OTP) === parseInt(code)) {
    req.app.locals.OTP = null; //reset the otp value
    req.app.locals.resetSession = true; // start the session for reset password
    return res.status(201).send({ msg: "verified successfully" });
  }
  return res.status(400).send({ error: "Invalid OTP" });
}

async function handlecreateResetSession(req, res) {
  if (req.app.locals.resetSession) {
    req.app.locals.resetSession = false;
    return res.status(201).send({ msg: "Reset session started" });
  }
  return res.status(440).send({ error: " Session expired!" });
}

// put routes handler

async function handleupdateUser(req, res) {
  try {
    const { id } = req.params;
    if (id) {
      const body = req.body;

      // update the data
      const result = await user.updateOne({ _id: id }, body, { new: true });
      if (result && result.nModified !== 0) {
        return res.status(200).json({ msg: "User updated successfully" });
      } else {
        console.error("Error occurred while updating user:", result);
        return res.status(404).json({ msg: "User not found" });
      }
    }
  } catch (error) {
    return res.status(401).send({ error });
  }
}

async function handleupdatePassword(req, res) {
  try {
    if (!req.app.locals.resetSession)
      return res.status(440).send({ error: " Session expired!" });

    const { username, password } = req.body;
    const validuser = await user.findOne({ username });

    // check for user
    if (!validuser) {
      return res.status(400).json({ error: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(password, saltOrRounds);

    if (!hashedPassword) {
      return res.status(500).json({ error: "Unable to hash password" });
    }

    const result = await user.updateOne(
      { username: validuser.username },
      { password: hashedPassword }
    );

    if (!result || result.nModified === 0) {
      return res.status(400).json({ error: "Unable to update password" });
    }

    return res.status(200).json({ msg: "Password updated successfully" });
  } catch (error) {
    console.error("Error in handleupdatePassword:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Import your User model here


 // Import your User model here

async function handleCreateUser(req, res) {
    try {
        // // Validate input fields
        // await Promise.all([
        //     body('email').isEmail().withMessage('Invalid email format'),
        //     body('password').isLength({ min: 5 }).withMessage('Password must be at least 5 characters long')
        // ]).forEach(validation => validation.run(req));

        // // Check for validation errors
        // const errors = validationResult(req);
        // if (!errors.isEmpty()) {
        //     return res.status(400).json({ errors: errors.array() });
        // }

        // Create user
        const newUser = await myuser.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            location: req.body.location
        });

        res.json({ success: true, user: newUser });
    } catch (err) {
        console.error("Error in handleCreateUser:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}









module.exports = {
  handleregister,
  handleauthenticate,
  handlelogin,
  handleuserName,
  handlegenerateOTP,
  handleverifyOTP,
  handlecreateResetSession,
  handleupdateUser,
  handleupdatePassword,
  verifyUser,
  handleregisterMail,
  handleCreateUser
};
