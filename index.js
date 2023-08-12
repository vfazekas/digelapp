const express = require("express");
const session = require('express-session');
const { google } = require("googleapis");
require('dotenv').config();
const userUtils = require('./functions/userUtils');
const { getGoogleSheetsClient } = require('./functions/googleSheetsUtils');


const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
var root = require('path').join(__dirname, '/src/img');
app.use(express.static(root));

// Configure session middleware
app.use(session({
 secret: 'mysecret',
 resave: false,
 saveUninitialized: false
}));

// Authentication middleware
function authenticate(req, res, next) {
 if (req.session.authenticated) {
  return next();
 }

 // User is not authenticated, redirect to the login page
 res.redirect('/');
}

app.get("/", (req, res) => {
 res.render("login", { message: '' })
});


app.post('/', async (req, res) => {
 const enteredUsername = req.body.username;
 const enteredPassword = req.body.password;

 try {
  const googleSheets = await getGoogleSheetsClient();

  const spreadsheetId = "1bWsIMAbVVUTqlANsHGAh3sT5Z14Cdudd9Hq7pQROGXg";

  // Read rows from spreadsheet
  const getUsuarios = await googleSheets.spreadsheets.values.get({
   spreadsheetId,
   range: "Usuários!A2:D",
  });
  const usuarios = getUsuarios.data.values;
  // Use the findUser function from userUtils.js
  const result = userUtils.findUser(usuarios, enteredUsername, enteredPassword);
  req.session.authenticated = true;

  // Check if the user is found
  if (typeof result === 'string') {
   // User not found, redirect to the login page with a message
   res.redirect('/?msg=User not found');
  } else {
   // User found, redirect to the menu page with the user information
   req.session.authenticated = true;
   req.session.user = result; // Store the 'result' object in the 'user' session variable
   res.redirect('/menu');
  }

 } catch (error) {
  console.error("Error occurred:", error);
  res.status(500).json({ error: "Internal Server Error" });
 }
});

app.get('/menu', authenticate, (req, res) => {
 // Access the user information from the session
 const user = req.session.user;
 // Render the 'menu' template and pass the user information as local variables
 res.render('menu', { user });

});


app.get('/order', authenticate, (req, res) => {

 const user = req.session.user;
 const products = [
  {
   name: 'Product 1',
   price: 19.99,
   description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
   image: 'logo.jpg' // Example image path
  },
  {
   name: 'Product 1',
   price: 19.99,
   description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
   image: '/images/product1.jpg' // Example image path
  },
  {
   name: 'Product 1',
   price: 19.99,
   description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
   image: '/images/product1.jpg' // Example image path
  },
  {
   name: 'Product 1',
   price: 19.99,
   description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
   image: '/images/product1.jpg' // Example image path
  },
 ]

 res.render('realizar_pedido', { user, products });

});







const PORT = 3000;

app.listen(PORT, (req, res) => console.log(`http://localhost:${PORT}`))


