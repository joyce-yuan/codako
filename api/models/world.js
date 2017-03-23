module.exports = (sequelize, Sequelize) => {
  return sequelize.define('world', {
    name: Sequelize.STRING,
    thumbnail: Sequelize.BLOB,
    data: Sequelize.BLOB,
    playCount: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    forkCount: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
  }, {
    classMethods: {
      associate: ({World, User}) => {
        World.belongsTo(World, {
          as: 'forkParent',
          foreignKey: 'forkParentId',
        });
        World.hasMany(World, {
          as: 'forks',
          foreignKey: 'forkParentId',
        });
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
          playCount: this.playCount,
          forkCount: this.forkCount,
          forkParent: this.forkParent ? this.forkParent.serialize() : null,
          user: this.user ? this.user.serialize() : null,
          thumbnail: this.thumbnail,
          createdAt: this.createdAt,
          updatedAt: this.updatedAt,
        };
      }
    },
  });
};
