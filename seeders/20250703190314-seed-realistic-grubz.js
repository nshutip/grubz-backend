'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Communities
    const communities = await queryInterface.bulkInsert('Communities', [
      {
        name: 'USIU-Africa',
        slug: 'usiu',
        description: 'United States International University - Africa',
        logo_url: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'JKUAT',
        slug: 'jkuat',
        description: 'Jomo Kenyatta University of Agriculture and Technology',
        logo_url: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], { returning: true });

    const communityUSIU = communities[0];
    const communityJKUAT = communities[1];

    // 2. Users
    const passwordHash = await bcrypt.hash('password123', 10);

    const users = await queryInterface.bulkInsert('Users', [
      {
        name: 'Alice Customer',
        email: 'alice@grubz.com',
        phone: '0711000000',
        password_hash: passwordHash,
        role: 'customer',
        communityId: communityUSIU.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Bob Vendor',
        email: 'bob@grubz.com',
        phone: '0711222222',
        password_hash: passwordHash,
        role: 'vendor',
        communityId: communityUSIU.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Clara Admin',
        email: 'clara@grubz.com',
        phone: '0711333333',
        password_hash: passwordHash,
        role: 'community_admin',
        communityId: communityUSIU.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], { returning: true });

    const vendorUser = users.find(u => u.email === 'bob@grubz.com');

    // 3. Vendors
    const vendors = await queryInterface.bulkInsert('Vendors', [
      {
        name: 'Bob’s Cafeteria',
        description: 'Fresh affordable meals on campus.',
        logo_url: null,
        is_approved: true,
        userId: vendorUser.id,
        communityId: communityUSIU.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], { returning: true });

    const vendor = vendors[0];

    // 4. MenuItems
    const menuItems = await queryInterface.bulkInsert('MenuItems', [
      {
        name: 'Ugali & Sukuma',
        description: 'Kenyan classic with beef stew.',
        price: 150.00,
        image_url: null,
        is_available: true,
        vendorId: vendor.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Chicken Wrap',
        description: 'Grilled chicken wrap with fries.',
        price: 250.00,
        image_url: null,
        is_available: true,
        vendorId: vendor.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], { returning: true });

    const customer = users.find(u => u.role === 'customer');
    const item1 = menuItems[0];
    const item2 = menuItems[1];

    // 5. Orders
    const orders = await queryInterface.bulkInsert('Orders', [
      {
        customerId: customer.id,
        vendorId: vendor.id,
        total_price: 400.00,
        status: 'completed',
        payment_status: 'paid',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], { returning: true });

    const order = orders[0];

    // 6. OrderItems
    await queryInterface.bulkInsert('OrderItems', [
      {
        orderId: order.id,
        menuItemId: item1.id,
        quantity: 1,
        price: item1.price,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        orderId: order.id,
        menuItemId: item2.id,
        quantity: 1,
        price: item2.price,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // 7. Payment
    await queryInterface.bulkInsert('Payments', [
      {
        orderId: order.id,
        amount: 400.00,
        method: 'momo',
        transaction_id: 'TXN12345678',
        status: 'success',
        paid_at: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Payments', null, {});
    await queryInterface.bulkDelete('OrderItems', null, {});
    await queryInterface.bulkDelete('Orders', null, {});
    await queryInterface.bulkDelete('MenuItems', null, {});
    await queryInterface.bulkDelete('Vendors', null, {});
    await queryInterface.bulkDelete('Users', null, {});
    await queryInterface.bulkDelete('Communities', null, {});
  }
};
