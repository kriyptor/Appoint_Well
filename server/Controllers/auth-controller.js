const db = require(`../Utils/database`);
const Users = require("../Models/users-model");
const Admin = require(`../Models/admin-model`);
const Staff = require(`../Models/staffs-model`);
const bcrypt = require(`bcrypt`);
const jwt = require(`jsonwebtoken`);
const { v4: uuidv4 } = require('uuid');
const { Op } = require(`sequelize`);
require('dotenv').config();


function isStringInvalid(string) {
  return string === undefined || string.length === 0;
}


const generateAccessToken = (id, name, role, email) => {
  return jwt.sign(
    { id: id, name: name, email: email, role: role },
    process.env.JWT_SECRET_KEY
  );
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

        const token = generateAccessToken(user.id, user.name, 'user', user.email);

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

        const token = generateAccessToken(admin.id, admin.name, 'admin', admin.email);

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
        
        //const isMatch = await bcrypt.compare(password, staff.password);
        
        if (staff.password!==password) {
            return res.status(401).json({
                success: false,
                message: `Invalid credentials!`
            });
        }

        const token = generateAccessToken(staff.id, staff.name, 'staff', staff.email);

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