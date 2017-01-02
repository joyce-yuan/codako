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
      serialize: function() {
        return {
          name: this.name,
          id: this.id,
          userId: this.userId,
          thumbnail: this.thumbnail,
          createdAt: this.createdAt,
          updatedAt: this.updatedAt,
        };
      }
    },
  });

  return Stage;
};
