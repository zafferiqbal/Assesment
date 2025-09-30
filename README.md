# LanguageKonnect - Minimal Build (Local)

## Server
cd server
cp .env.example .env
# edit .env with your values (use Stripe test keys)
npm install
npm run dev   # or npm start

## Client
cd client
cp .env .env.local   # update VITE_API_URL if backend hosted elsewhere
npm install
npm run dev

# Flow
1. Open client (default Vite port 5173): http://localhost:5173
2. On Landing page enter email and click Join Now -> Stripe Checkout (test mode)
3. After payment finish you'll be redirected to /thankyou then to /dashboard
4. Dashboard will show updated tickets (socket.io) and you can upload submission
5. Leaderboard updates in realtime

# Stripe webhook locally
Use: stripe listen --forward-to localhost:4000/webhook
Copy webhook secret to STRIPE_WEBHOOK_SECRET in server .env
