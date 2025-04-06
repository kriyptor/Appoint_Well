const Sequelize = require(`sequelize`);
const db = require(`../Utils/database`);

const Services = db.define(`Services`, {
    id : {
        type :  Sequelize.STRING,
        allowNull : false,
        primaryKey: true,
    },

    title : {
        type : Sequelize.STRING,
        allowNull : false,
    },

    duration : {
        type : Sequelize.TIME,
        allowNull : false
    },

    price : {
        type : Sequelize.DOUBLE,
        allowNull : false
    },

    category : {
        type : Sequelize.ENUM('Hair', 'Nail', 'Skincare', 'Makeup'),
        allowNull : false
    },

    description : {
        type : Sequelize.STRING,
        allowNull : false
    },

    serviceImage : {
        type : Sequelize.STRING,
        allowNull : false,
        defaultValue: `https://naomisheadmasters.com/wp-content/uploads/2023/12/Top-10-Salons-In-Himachal-Pradesh1.jpg`
    },

});

module.exports = Services;