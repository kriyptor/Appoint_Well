const Users = require(`../Models/users-model`);


exports.addWalletMoney = async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount } = req.body;

        await Users.increment('walletBalance', { by: amount, where: { id: userId }});

        return res.status(200).json({ 
            success: true,
            message: 'Balance added to the user wallet',
        });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}