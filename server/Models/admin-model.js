const Sequelize = require(`sequelize`);
const db = require(`../Utils/database`);
const bcrypt = require('bcrypt');

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
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },

    password: {
        type: Sequelize.STRING,
        allowNull: false
    },

    profilePicture: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: `https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg`
    },
}, {
    hooks: {
        beforeCreate: async (admin) => {
            const salt = 10;
            admin.password = await bcrypt.hash(admin.password, salt);
        }
    }
});

module.exports = Admin;