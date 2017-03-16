module.exports = (sequelize, Sequelize) => {
  const World = sequelize.define('world', {
    name: Sequelize.STRING,
    thumbnail: Sequelize.STRING,
    data: Sequelize.BLOB,
  }, {
    classMethods: {
      associate: ({User}) => {
        World.belongsTo(User, {
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
          user: this.user ? this.user.serialize() : null,
          thumbnail: this.thumbnail,
          createdAt: this.createdAt,
          updatedAt: this.updatedAt,
        };
      }
    },
  });

  return World;
};
