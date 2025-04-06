const Sequelize = require(`sequelize`);
const db = require(`../Utils/database`);

const StaffMember = db.define(`Staff-Members`, {
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

    phoneNumber : {
        type : Sequelize.STRING,
        allowNull : false
    },

    specializations : {
        type : Sequelize.STRING,
        allowNull : false
    },

    profilePicture : {
        type : Sequelize.STRING,
        allowNull : true,
    },

});

module.exports = StaffMember;