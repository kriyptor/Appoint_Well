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

    Comment : {
        type : Sequelize.TEXT,
        allowNull : true,
    },

    adminResponse : {
        type : Sequelize.TEXT,
        allowNull : true,
    },

});

module.exports = Reviews;