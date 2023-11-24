

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const methodOverride = require('method-override'); 
const products = require('./products');  // Import the products file



// MongoDB connection
// mongoose.connect('mongodb://localhost:27017/', { useNewUrlParser: true, useUnifiedTopology: true });

// Define a User model
const User = mongoose.model('User', {
  username: String,
  email: String,
  password: String,
});


app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  res.render('index', { products });
});

app.get('/new', (req, res) => {
  res.render('newCardForm');
});

app.post('/new', (req, res) => {
  const newProduct = {
    imageUrl: req.body.imageUrl, 
    name: req.body.name,
    price: req.body.price,
    description: req.body.description,
  };

  products.push(newProduct);

  res.redirect('/');
});

app.get('/product/:id', (req, res) => {
  const productId = req.params.id;
  const product = products[productId];

  if (!product) {
    return res.status(404).send('Product not found.');
  }

  res.render('product', { product });
});



app.post('/product/:id/review', (req, res) => {
  const productId = req.params.id;
  const { rating, comment } = req.body;
  const newReview = {
    rating: parseInt(rating),
    comment,
  };

  if (!products[productId].reviews) {
    products[productId].reviews = [];
  }

  products[productId].reviews.push(newReview);

  res.redirect(`/product/${productId}`);
});



app.get('/products/:id/edit', (req, res) => {
  const productId = parseInt(req.params.id);
  const product = products.find((p) => p.id === productId);

  if (!product) {
    return res.status(404).send('Product not found');
  }

  res.render('edit-product', { product });
});

app.put('/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const productIndex = products.findIndex((p) => p.id === productId);

  if (productIndex === -1) {
    return res.status(404).send('Product not found');
  }

  const updatedProduct = {
    id: productId,
    name: req.body.name,
    price: parseFloat(req.body.price),
    imageUrl: products[productIndex].imageUrl, 
    description: products[productIndex].description 
  };

  products[productIndex] = updatedProduct;
  res.redirect(`/products/${productId}`);
});

app.get('/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const product = products.find((p) => p.id === productId);

  if (!product) {
    return res.status(404).send('Product not found');
  }

  res.render('product', { product });
});


app.delete('/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const productIndex = products.findIndex((p) => p.id === productId);

  if (productIndex === -1) {
    return res.status(404).send('Product not found');
  }

  products.splice(productIndex, 1);

  res.redirect('/');
});

app.get('/login', (req, res) => {
  res.render('login');
});







// Registration route
app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(409).json({ message: 'Username or email already in use' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    // Save the user to the database
    await newUser.save();

    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});












































const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});



