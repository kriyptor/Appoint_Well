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

    specializations : {
        type : Sequelize.ARRAY(Sequelize.STRING),
        allowNull : false,
        validate :{
            isIn : [['hair', 'nail', 'skincare', 'makeup']]
        }
    },

    profilePicture : {
        type : Sequelize.STRING,
        allowNull : true,
        defaultValue: `https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg`
    },

});

module.exports = StaffMember;