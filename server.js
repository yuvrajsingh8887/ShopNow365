

const express = require('express');
const app = express();
const crypto = require('crypto');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');
const methodOverride = require('method-override'); 
const products = require('./products'); 


const mongoURI = 'mongodb://127.0.0.1:27017/ShopNow365';
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});



app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'secretKey',
  resave: true,
  saveUninitialized: true
}));
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



// Define a User model
const User = mongoose.model('User', {
  username: String,
  email: String,
  password: String,
});

app.get('/register', (req, res) => {
  res.render('register'); 
});


app.post('/register', async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    // check kre ki user exists krtaa hai ki nhi
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(409).json({ message: 'Username or email already in use' });
    }

    // password security ke liye
    const hashedPassword = await bcrypt.hash(password, 10);

    // new user create krne ke liye
    const newUser = new User({
      name,
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    req.session.userId = newUser._id;

    res.redirect('/login');
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
app.get('/login', (req, res) => {
  res.render('login');
});


// Handle login
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    // Check if the user exists and the password is correct
    if (user && await bcrypt.compare(password, user.password)) {
      // Set user session (optional)
      req.session.userId = user._id;

      // Redirect to the home page after successful login
      res.redirect('/');
    } else {
      // If login fails, send an alert message
      res.status(401).send('<script>alert("Invalid login credentials"); window.location="/login";</script>');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('<script>alert("Internal Server Error"); window.location="/login";</script>');
  }
});




app.post('/cart/add/:productId', (req, res) => {
  const productId = req.params.productId;
  const product = products.find(p => p.id === parseInt(productId));

  if (!product) {
    return res.status(404).send('Product not found');
  }

  cartItems.push({
    id: product.id,
    name: product.name,
    price: product.price,
  });

  console.log('Updated cartItems:', cartItems);

  res.redirect('/');
});

app.get('/cart', (req, res) => {
  res.render('cart', { cartItems });
});


const cartItems = [];



const PORT = 3003;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});



