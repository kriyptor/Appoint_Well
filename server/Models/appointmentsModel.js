const Sequelize = require(`sequelize`);
const db = require(`../Utils/database`);

const Appointments = db.define(`Appointments`, {
    id : {
        type :  Sequelize.STRING,
        allowNull : false,
        primaryKey: true,
    },

    status : {
        type : Sequelize.STRING,
        allowNull : false,
    },

    date: {
        type: Sequelize.DATEONLY,
        allowNull: false
    },

    startTime : {
        type : Sequelize.TIME,
        allowNull : false
    },

   /*  endTime : {
        type : Sequelize.TIME,
        allowNull : false
    }, */

    price : {
        type : Sequelize.DOUBLE,
        allowNull : false
    },

    paymentStatus : {
        type : Sequelize.STRING,
        allowNull : false
    },
});

module.exports = Appointments;