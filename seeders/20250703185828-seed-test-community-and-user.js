'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const [community] = await queryInterface.bulkInsert('Communities', [{
      name: 'Test Community',
      slug: 'test-community',
      description: 'This is a test community.',
      logo_url: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }], { returning: true });

    await queryInterface.bulkInsert('Users', [{
      name: 'John Doe',
      email: 'john@example.com',
      phone: '0700000000',
      password_hash: '$2b$10$7VY1v0X1z4UR1p1a1jX3YO9I1xFQOQaBSJoUYJZ0ZAfMUMTXZhD0e', // hashed 'password'
      role: 'customer',
      communityId: community.id,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {});
    await queryInterface.bulkDelete('Communities', null, {});
  }
};
