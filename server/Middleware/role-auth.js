const Admin = require(`../Models/admin-model`);
const Staffs = require("../Models/staffs-model");
const Users = require(`../Models/users-model`);
const jwt = require(`jsonwebtoken`);
require(`dotenv`).config();

const roleModelMap = {
    admin : Admin,
    user : Users,
    staff : Staffs
}

exports.authenticate = (allowedRoles = []) => {
    return async (req, res, next) => {
        try {

            if(allowedRoles.length === 0){
                throw new Error('At least one role is required for validation!')
            }

            /* ------------Initial Token Validation------------ */
            const token = req.header(`Authorization`);
    
            if(!token){
                return res.status(401).json({ error: 'Access Denied. No token Provided!' });
            }
    
            const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);
            const { id, role } = decodedData;


            /* Validating the role */
            if(!role || !roleModelMap[role]){
                return res.status(401).json({
                    success: false,
                    message: 'Invalid role in token'
                });
            }

            if(!allowedRoles.includes(role)){
                return res.status(403).json({
                    success: false,
                    message: 'Insufficient permissions'
                });
            }

            const Model = roleModelMap[role];
            const entityData = await Model.findByPk(id);

            if(!entityData){
                return res.status(401).json({
                    success: false,
                    message: `${role} not found`
                });
            }

            switch (role) {
                case 'admin':
                    req.admin = entityData;
                    break;
                case 'user':
                    req.user = entityData;
                    break;
                case 'staff':
                    req.staff = entityData;
                    break;
                default:
                    break;
            }
            
            console.log(`${role} >>>>`, decodedData); // Optional logging

            next();
    
        } catch (error) {
            console.log("Authentication error:", error);
            return res
              .status(401)
              .json({ success: false, message: "Invalid token" });
        }
    }
}