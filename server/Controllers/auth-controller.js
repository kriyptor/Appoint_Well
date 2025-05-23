const db = require(`../Utils/database`);
const Users = require("../Models/users-model");
const Admin = require(`../Models/admin-model`);
const Staff = require(`../Models/staffs-model`);
const bcrypt = require(`bcrypt`);
const jwt = require(`jsonwebtoken`);
const { v4: uuidv4 } = require('uuid');
const { Op } = require(`sequelize`);
const { comparePassword, encrypt } = require("../Utils/encryption-Decryption");
require('dotenv').config();


function isStringInvalid(string) {
  return string === undefined || string.length === 0;
}


/* const generateAccessToken = (id, name, role, email) => {
  return jwt.sign(
    { id: id, name: name, email: email, role: role },
    process.env.JWT_SECRET_KEY
  );
}; */

const generateAccessToken = (id, role) => {
    return jwt.sign({ id: id, role: role }, process.env.JWT_SECRET_KEY );
  };

exports.createUser = async (req, res) => {
    try {
        const { name, email, phoneNumber, password } = req.body;
        
        // Validate inputs
        if (isStringInvalid(name) || isStringInvalid(email) || isStringInvalid(password)) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }
        
        const isUserExist = await Users.findOne({ where: { email: email } });

        if (isUserExist) {
            return res.status(400).json({
                success: false,
                message: `User already exists!`
            });
        }

        const newId = uuidv4();
        const salt = 10;
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const newUser = {
            id: newId,
            name: name,
            email: email,
            phoneNumber: phoneNumber,
            password: hashedPassword,
        }
        
        await Users.create(newUser);

        return res.status(201).json({
            success: true,
            message: 'Successfully created new user'
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

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validate inputs
        if (isStringInvalid(email) || isStringInvalid(password)) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        const user = await Users.findOne({ where: { email: email } });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: `User does not exist!`
            });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: `Invalid credentials!`
            });
        }

        const token = generateAccessToken(user.id, 'user');

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token: token
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

exports.getUserData = async (req, res) => {
    try {
        
        const userId = req.user.id;
    
        const user = await Users.findOne({ where: { id: userId } });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: `User does not exist!`
            });
        }

        return res.status(200).json({
            success: true,
            message: 'User Data',
            data: user
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

/* -----------User Data Update------------ */

exports.updateUserData = async (req, res) => {
    try {

        const userId = req.user.id;

        const { name, email, password, profilePicture } = req.body;
        
        // Validate inputs
        if (isStringInvalid(name) || isStringInvalid(email) || isStringInvalid(profilePicture)) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        const updatedUserData  = {
            name: name,
            email : email,
            profilePicture : profilePicture
        }

        if(password.length !== 0){
            const salt = 10;
            const hashedPassword = await bcrypt.hash(password, salt);
            updatedUserData.password  = hashedPassword;
        }
        
        const updatedUser = await Users.update(updatedUserData, { where : { id : userId } })
    
        return res.status(200).json({
            success: true,
            message: 'User data updated',
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


/* --------------Admin Controller----------------- */

exports.loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validate inputs
        if (isStringInvalid(email) || isStringInvalid(password)) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        const admin = await Admin.findOne({ where: { email: email } });

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: `Admin does not exist!`
            });
        }
        
        const isMatch = await bcrypt.compare(password, admin.password);
        
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: `Invalid credentials!`
            });
        }

        const token = generateAccessToken(admin.id, 'admin');

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token: token
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

exports.getAdminData = async (req, res) => {
    try {
        
        const adminId = req.admin.id;
    
        const admin = await Admin.findOne({ where: { id: adminId } });

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: `Admin does not exist!`
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Admin Data',
            data: admin
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

exports.updateAdminData = async (req, res) => {
    try {

        const adminId = req.admin.id;

        const { name, email, password, profilePicture } = req.body;
        
        // Validate inputs
        if (isStringInvalid(name) || isStringInvalid(email) || isStringInvalid(profilePicture)) {
            return res.status(400).json({
                success: false,
                message: 'Email are required'
            });
        }

        const updatedAdminData  = {
            name: name,
            email : email,
            profilePicture : profilePicture
        }

        if(password.length !== 0){
            const salt = 10;
            const hashedPassword = await bcrypt.hash(password, salt);
            updatedAdminData.password  = hashedPassword;
        }
        
        const updatedAdmin = await Admin.update(updatedAdminData, { where : { id : adminId } })
    
        return res.status(200).json({
            success: true,
            message: 'Admin data updated',
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


/* ----------------Staff auth------------------ */


exports.loginStaff = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validate inputs
        if (isStringInvalid(email) || isStringInvalid(password)) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        const staff = await Staff.findOne({ where: { email: email } });       

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: `Staff does not exist!`
            });
        }
        
        const isMatch = comparePassword(password.trim(), staff.password);
        
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: `Invalid credentials!`
            });
        }

        console.log('Staff Data', staff.id)

        const token = generateAccessToken(staff.id, 'staff');

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token: token
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

exports.getStaffData = async (req, res) => {
    try {
        
        const staffId = req.staff.id;
    
        const staff = await Staff.findOne({ where: { id: staffId } });

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: `Staff does not exist!`
            });
        }

        return res.status(200).json({
            success: true,
            message: 'User Data',
            data: staff
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


exports.updateStaffData = async (req, res) => {
    try {

        const staffId = req.staff.id;

        const { name, password, profilePicture } = req.body;
        
        // Validate inputs
        if (isStringInvalid(name) || isStringInvalid(profilePicture)) {
            return res.status(400).json({
                success: false,
                message: 'Email are required'
            });
        }

        const updatedStaffData  = {
            name: name,
            profilePicture : profilePicture
        }

        if(password.length !== 0){
            updatedStaffData.password  = encrypt(password.trim());
        }
        
        const updatedStaff = await Staff.update(updatedStaffData, { where : { id : staffId } })
    
        return res.status(200).json({
            success: true,
            message: 'staff data updated',
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