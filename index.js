// server/index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Stripe = require('stripe');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');

const User = require('./models/User');
const Entry = require('./models/Entry');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || '*' }
});

// Important: use raw body for webhook route only
app.use((req, res, next) => {
  if (req.originalUrl === '/webhook') {
    bodyParser.raw({ type: 'application/json' })(req, res, next);
  } else {
    express.json()(req, res, next);
  }
});

app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(()=> console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connect error', err));

// Socket.IO
io.on('connection', (socket) => {
  console.log('socket connected', socket.id);
  socket.on('join', (email) => {
    if (!email) return;
    socket.join(email);
  });
});

// Create Stripe Checkout session
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'email required' });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: 'LanguageKonnect Challenge Ticket' },
          unit_amount: 700 // $7 in cents
        },
        quantity: 1
      }],
      success_url: `${process.env.CLIENT_URL}/thankyou?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/?canceled=true`,
      customer_email: email,
      metadata: { email }
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('create-checkout error', err);
    res.status(500).json({ error: 'internal' });
  }
});

// Webhook endpoint (must use raw body)
app.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const email = session.metadata?.email || session.customer_email;

    try {
      const user = await User.findOneAndUpdate(
        { email },
        { $inc: { tickets: 1 }, $setOnInsert: { email } },
        { upsert: true, new: true }
      );

      // Emit to specific user room and broadcast for leaderboard changes
      io.to(email).emit('tickets:update', { tickets: user.tickets });
      io.emit('leaderboard:ticket', { email, tickets: user.tickets });

      console.log(`Credited ticket to ${email}. Total: ${user.tickets}`);
    } catch (dbErr) {
      console.error('DB error in webhook:', dbErr);
    }
  }

  res.json({ received: true });
});

// API: get tickets for an email
app.get('/api/tickets', async (req, res) => {
  const email = req.query.email;
  if (!email) return res.json({ tickets: 0 });
  const user = await User.findOne({ email });
  res.json({ tickets: user ? user.tickets : 0 });
});

// API: upload entry
app.post('/api/upload', async (req, res) => {
  try {
    const { title, url, email } = req.body;
    if (!title || !url || !email) return res.status(400).json({ error: 'title,url,email required' });

    const entry = await Entry.create({ title, url, authorEmail: email });
    io.emit('leaderboard:new', entry);
    return res.json({ ok: true, entry });
  } catch (err) {
    console.error('upload error', err);
    return res.status(500).json({ error: 'internal' });
  }
});

// API: get entries
app.get('/api/entries', async (req, res) => {
  const entries = await Entry.find().sort({ createdAt: -1 }).limit(100);
  res.json(entries);
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server listening on ${PORT}`));
