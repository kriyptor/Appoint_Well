const Sequelize = require(`sequelize`);
const db = require(`../Utils/database`);

const StaffService = db.define(`Staff-Service`, {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      }
});

module.exports = StaffService;