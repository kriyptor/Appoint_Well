const Sequelize = require(`sequelize`);
const db = require(`../Utils/database`);

const StaffService = db.define(`Staff-Service`, {
    id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false,
      }
});

module.exports = StaffService;