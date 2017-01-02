module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define('user', {
    email: Sequelize.STRING,
    username: Sequelize.STRING,
    passwordHash: Sequelize.STRING,
    passwordSalt: Sequelize.STRING,
  }, {
    indexes: [
      {unique: true, fields: ['email']},
      {unique: true, fields: ['username']},
    ],
    classMethods: {
      associate: () => {
      },
    },
    instanceMethods: {
      serialize: function () {
        return {
          id: this.id,
          username: this.username,
          email: this.email,
        };
      },
    },
  });

  return User;
};
