const Sequelize = require(`sequelize`);
const db = require(`../Utils/database`);

const Users = db.define(`Users`, {
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

    /* phoneNumber : {
        type : Sequelize.BIGINT,
        allowNull : false,
        defaultValue: 123456789
    }, */

    profilePicture: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: `https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg`
    },

    walletBalance: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1000
    }

});

module.exports = Users;