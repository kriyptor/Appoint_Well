const jwt = require(`jsonwebtoken`);
const Users = require(`../Models/users-model`);
require(`dotenv`).config();


exports.adminAuthenticate = async (req, res, next) => {
    try {
        const token = req.header(`Authorization`);

        if(!token){
            return res.status(401).json({ error: 'Access Denied. No token Provided!' });
        }

        const decodedUser = jwt.verify(token, process.env.JWT_SECRET_KEY);

        console.log(`Admin >>>>`, decodedUser);

        const validAdmin =  await Users.findByPk(decodedUser.userId);

        if(!validAdmin){
            return res.status(401).json({ success: false, message: "User not found" });
        };

        if(!validAdmin.isAdmin){
            return res.status(401).json({ success: false, message: "User is not admin" });
        }

        req.admin = validAdmin;

        next();

    } catch (error) {
        console.log("Authentication error:", error);
        return res
          .status(401)
          .json({ success: false, message: "Invalid token" });
    }
}