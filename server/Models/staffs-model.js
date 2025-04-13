const Sequelize = require(`sequelize`);
const db = require(`../Utils/database`);

const Staffs = db.define(`Staff-Members`, {
    id : {
        type :  Sequelize.STRING,
        allowNull : false,
        primaryKey: true,
    },

    name : {
        type : Sequelize.STRING,
        allowNull : false,
    },

    email : {
        type : Sequelize.STRING,
        allowNull : false
    },

    password: {
        type: Sequelize.STRING,
        allowNull: false
    },

    specializations : {
        type : Sequelize.JSON,
        allowNull : false,
        validate: {
            isValidSpecialization(value) {
                const validOptions = ['hair', 'nail', 'skincare', 'makeup'];
                if (!Array.isArray(value) || !value.every(item => validOptions.includes(item))) {
                    throw new Error('Invalid specialization provided');
                }
            }
        }
    },

    profilePicture : {
        type : Sequelize.TEXT,
        allowNull : false,
        defaultValue: `https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg`
    },

});

module.exports = Staffs;