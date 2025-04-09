const Sequelize = require(`sequelize`);
const db = require(`../Utils/database`);

const Reviews = db.define(`Reviews`, {
    id : {
        type :  Sequelize.STRING,
        allowNull : false,
        primaryKey: true,
    },

    rating : {
        type : Sequelize.INTEGER,
        allowNull : false
    },

    comment : {
        type : Sequelize.TEXT,
        allowNull : true,
    },

    isStaffResponded : {
        type : Sequelize.BOOLEAN,
        allowNull : false,
        defaultValue : false
    },

    staffResponse : {
        type : Sequelize.TEXT,
        allowNull : true,
    },

});

module.exports = Reviews;