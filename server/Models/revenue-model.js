const Sequelize = require(`sequelize`);
const db = require(`../Utils/database`);

const Revenue = db.define(`Revenue`, {
    id : {
        type :  Sequelize.INTEGER,
        allowNull : false,
        primaryKey: true,
        autoIncrement: true,
    },

    totalRevenue : {
        type : Sequelize.INTEGER,
        allowNull : false
    },

    hairServiceRevenue : {
        type : Sequelize.INTEGER,
        allowNull : false
    },

    nailServiceRevenue : {
        type : Sequelize.INTEGER,
        allowNull : false
    },

    skincareServiceRevenue : {
        type : Sequelize.INTEGER,
        allowNull : false
    },

    makeupServiceRevenue : {
        type : Sequelize.INTEGER,
        allowNull : false
    },

    totalRefunds : {
        type : Sequelize.INTEGER,
        allowNull : false
    },

});

module.exports = Revenue;