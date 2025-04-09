const Sequelize = require(`sequelize`);
const db = require(`../Utils/database`);
const Users = require(`./users-model`);

const UserWallet = db.define(`User-Wallet`, {
    id : {
        type :  Sequelize.STRING,
        allowNull : false,
        primaryKey: true,
    },

    userId : {
        type :  Sequelize.STRING,
        allowNull : false,
        primaryKey: true,
        references: {
            model: Users,  
            key: 'id'    
        },
        onDelete: 'CASCADE'
    },

    totalFund : {
        type : Sequelize.INTEGER,
        allowNull : false,
        defaultValue: 0
    }

});

module.exports = UserWallet;