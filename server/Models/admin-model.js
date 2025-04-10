const Sequelize = require(`sequelize`);
const db = require(`../Utils/database`);

const Admin = db.define(`Admin`, {
    id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
    },

    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },

    email: {
        type: Sequelize.STRING,
        allowNull: false
    },

    password: {
        type: Sequelize.STRING,
        allowNull: false
    },

    profilePicture: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: `https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg`
    },

});

module.exports = Admin;