module.exports = (sequelize, Sequelize) => {
  const Stage = sequelize.define('stage', {
    name: Sequelize.STRING,
    thumbnail: Sequelize.STRING,
    data: Sequelize.BLOB,
  }, {
    classMethods: {
      associate: ({User}) => {
        Stage.belongsTo(User, {
          onDelete: "CASCADE",
          foreignKey: {
            allowNull: false,
          },
        });
      },
    },
    instanceMethods: {
    },
  });

  return Stage;
};
