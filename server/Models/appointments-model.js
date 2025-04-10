const Sequelize = require(`sequelize`);
const db = require(`../Utils/database`);

const Appointments = db.define(`Appointments`, {
    id : {
        type :  Sequelize.STRING,
        allowNull : false,
        primaryKey: true,
    },

    status: {
        type: Sequelize.ENUM('scheduled', 'rescheduled', 'canceled', 'completed', 'unattained'),
        allowNull: false,
        defaultValue: 'scheduled'
      },
    
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
    
      startTime: {
        type: Sequelize.TIME,
        allowNull: false
      },
    
      price: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
    
      paymentStatus: {
        type: Sequelize.ENUM('pending', 'paid', 'failed'),
        allowNull: false
      }
});

module.exports = Appointments;