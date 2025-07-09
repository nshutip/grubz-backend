require('dotenv').config();
const express = require('express');
const app = express();

const { sequelize } = require('./models');


app.use('/api/payments/webhook/stripe', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.send('Welcome to Grubz API 🚀');
});

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const communityRoutes = require('./routes/community.routes');
const vendorRoutes = require('./routes/vendor.routes');
const orderRoutes = require('./routes/order.routes');
const customerRoutes = require('./routes/customer.routes');
const communityAdminRoutes = require('./routes/communityAdmin.routes');
const paymentRoutes = require('./routes/payment.routes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/admin/community', communityAdminRoutes);
app.use('/api/payments', paymentRoutes);

sequelize.authenticate()
  .then(() => console.log('Connected to DB'))
  .catch((err) => console.error('DB Error:', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`));

