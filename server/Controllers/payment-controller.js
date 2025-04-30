const Users = require(`../Models/users-model`);
const Revenue = require(`../Models/revenue-model`);
const { Cashfree } = require(`cashfree-pg`);
const { v4: uuidv4 } = require('uuid');
require("dotenv").config();

Cashfree.XClientId = process.env.CLIENT_ID;
Cashfree.XClientSecret = process.env.CLIENT_SECRET;
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX;


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


exports.getWalletBalance = async (req, res) => {
    try {
        const userId = req.user.id;

        const userData = await Users.findByPk(userId);

        if(!userData){
            return res.status(404).json({ 
                success: false,
                message: 'No User Found!',
            });
        }

        return res.status(200).json({ 
            success: true,
            message: 'User Wallet Balance',
            data : userData.walletBalance
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

exports.getRevenueData = async (req, res) => {
    try {

        const revenueData = await Revenue.findOne({ where : { id: 1 }});

        if(!revenueData){
            return res.status(404).json({ 
                success: false,
                message: 'Data Not Found',
            });
        }

        return res.status(200).json({ 
            success: true,
            message: 'Revenue Data',
            data : revenueData
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


/* ---------Payment gateway end points----------- */
exports.createOrder = async (req, res) => {
    try {
        const userId  = req.user.id;
        const amount  = req.body.amount; 

        const expiryDate = new Date(Date.now() + 60 * 60 * 1000); //1hr from now
        const formattedExpiryDate = expiryDate.toISOString();

        const paymentUserId = `user_${uuidv4()}`; // Generate a unique customer ID

        const request = {
            "order_amount": amount,
            "order_currency": "INR",
            "order_id": uuidv4(),
            "customer_details": {
                "customer_id": paymentUserId,
                "customer_phone": "8474090589"
            },
            "order_meta": {
                "return_url": "http://localhost:5173/user/",
                "payment_methods": "cc,dc,upi"
            },
            "order_expiry_time": formattedExpiryDate
        };

        const response = await Cashfree.PGCreateOrder("2023-08-01", request);

        const orderId = response.data.order_id;

        // Create payment entry
        //await Payments.create({ id: orderId, userId: userId });

        res.status(201).json({
            success: true,
            message: "Payment Initiated",
            result: response.data
        });

    } catch (error) {
        console.error("Error Creating order", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};


exports.verifyPayment = async (req, res) => {
    //const transaction = await db.transaction();
    try {
        const userId  = req.user.id; 
        const orderId = req.body.orderId; 

        // Input validation
        if (!orderId || !userId) {
            return res.status(400).json({ success: false, error: "Missing credentials" });
        }

        const response = await Cashfree.PGOrderFetchPayments("2023-08-01", orderId);

        const getOrderResponse = response.data;

        let orderStatus = "Failure"; // Default to failure
        if (
            getOrderResponse.filter(
                (transaction) => transaction.payment_status === "SUCCESS"
            ).length > 0
        ) {
            orderStatus = "Success";
        } else if (
            getOrderResponse.filter(
                (transaction) => transaction.payment_status === "PENDING"
            ).length > 0
        ) {
            orderStatus = "Pending";
        }

        if (orderStatus === "Success") {
            // Update payment status
           /*  const [updatePayment] = await Payments.update(
                { paymentStatus: true },
                { where: { id: orderId, userId: userId } },
                { transaction }
            );

            if (updatePayment === 0) {
                await transaction.rollback();
                return res.status(400).json({ success: false, error: "Failed to update payment" });
            } */

            /* if (updatedUser === 0) {
                await transaction.rollback();
                return res.status(400).json({ success: false, error: "Failed to update user" });
            } */

            res.status(200).json({ 
                success: true, 
                message: `Payment ${orderStatus}` 
            });
        }

    } catch (error) {
        //await transaction.rollback(); // rollback the transaction
        console.error("Payment verification error:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};