const express = require("express");
const Router = express.Router();
const homeSchema = require("../models/homeSchema");


Router.get('/', (err, res) => {
    res.render('main', { title: "Fill The Form", password:" ", email:" "})
})

Router.get('/login', (req, res) => {
  // Render your login page here
  res.render('login');
});

Router.get('/register', (req, res) => {
  // Render the register page with the necessary variables
  res.render('register', { title: "Registration Page", password: "", email: "" });
});

Router.post('/search', async (req, res) => {
  const { need } = req.body;

  try {
    // Find users whose available items match the user's need
    const matchingUsers = await homeSchema.find({ available: need });

    if (matchingUsers.length === 0) {
      // Render JSON with a "No user found" message
      res.json({ message: "No users found matching your need." });
    } else {
      // If matching users found, render the users
      res.json({ matchingUsers });
    }
  } catch (error) {
    console.error("Error searching for matching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

Router.post('/register', async (req, res) => {
  try {
    const {
      name,
      number,
      email,
      need,
      available,
      password,
      cpassword
    } = req.body;

    if (password === cpassword) {
      // Check if the email already exists in the database
      const existingUser = await homeSchema.findOne({ email: email });
      if (existingUser) {
        // If the email already exists, render the registration page with an error message
        return res.render('register', {
          title: "Email already registered",
          password: "",
          email: ""
        });
      }

      // If the email is not already registered, proceed with registration
      const userData = new homeSchema({
        name,
        number,
        email,
        need,
        available,
        password
      });

      await userData.save();

      // Redirect to login page after successful registration
      return res.redirect('/login');
    } else {
      return res.render('register', {
        title: " ",
        password: "Password not matching",
        email: " "
      });
    }
  } catch (error) {
    console.error("Error in registration:", error);
    return res.render('register', {
      title: "Error in registration",
      password: "",
      email: ""
    });
  }
});



// signin

Router.post('/login', (req, res) => {
  const { email, password } = req.body;

  homeSchema.findOne({ email: email, password: password }, (err, result) => {
      if (err) {
          // Handle error
          res.render('register', { title: "Error", password: "", email: "" });
      } else {
          if (result) {

              // If login successful, redirect to dashboard with user's id
              res.redirect(`/login/${result._id}`);
          } else {
              // If email or password is incorrect, render login page with error message
              res.render('register', { title: "Invalid email or password", password: "", email: "" });
          }
      }
  });
});



//for getting id from fontend

Router.get('/login/:id', async (req, res) => {
  const userId = req.params.id;
  const user = await homeSchema.findById(userId);

  if (!user) {
    // Handle user not found
    return res.render('error', { message: "User not found" });
  }

  try {
    const matchingUsers = await homeSchema.find({ available: user.need });
    res.render('dashbord', { title: "Dashboard", user: user, userId: userId, matchingUsers });
  } catch (error) {
    // Handle error fetching matching users
    console.error("Error fetching matching users:", error);
    res.render('error', { message: "An error occurred", error: error });
  }
});


//Update

Router.post('/update/:id', async (req, res) => {
  try {
      const userId = req.params.id;
      const { need, available } = req.body;

      // Update the document in the database
      await homeSchema.findByIdAndUpdate(userId, { need, available });

      // Redirect to the dashboard page with the updated user ID
      res.redirect(`/login/${userId}`);
  } catch (error) {
      console.error("Error in updating:", error);
      // Render the dashboard view with error message
      res.render('dashbord', { title: "Error in updating" });
  }
});


module.exports = Router;