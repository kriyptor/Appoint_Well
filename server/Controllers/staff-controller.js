const db = require(`../Utils/database`);
const { v4: uuidv4 } = require('uuid');
const Services = require(`../Models/services-model`);
const Staff = require(`../Models/staffs-model`);
const { generatePassword } = require(`../Utils/utility-functions`);
const StaffService = require(`../Models/staff-service-model`);
const { encrypt, decrypt } = require('../Utils/encryption-Decryption');

exports.createStaff = async (req, res) => {
    const transaction = await db.transaction(); 
    try {
        const { name, specializations, profilePicture, serviceIds } = req.body;

        // Basic field validation
        if (!name ||
            !Array.isArray(specializations) || specializations.length === 0 ||
            !Array.isArray(serviceIds) || serviceIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        };

        const uniqueServiceIds = [...new Set(serviceIds)];

        // Create staff with conditional profilePicture
        const staffId = uuidv4();
        const staffEmail = `${name}.staff@appointwell.com`;
        const staffPassword = generatePassword(name); 
        //Hashing the password before storing it
        const encryptedPassword = encrypt(staffPassword);

        const staffData = {
            id: staffId,
            name : name,
            email : staffEmail,
            password : encryptedPassword,
            specializations : specializations
        };
        

        //update the specific field if data is available
        if(profilePicture) {
            staffData.profilePicture = profilePicture;
        }
        
        const newStaff = await Staff.create(staffData, { transaction });

        // Create service associations using the already deduped array
        const staffServicesMappedData = uniqueServiceIds.map(serviceId => {
            return { staffId, serviceId }
        });

        await StaffService.bulkCreate(staffServicesMappedData, { transaction });

        await transaction.commit();

        return res.status(201).json({ 
            success: true,
            message: 'A new staff created',
            data: newStaff
        });
        
    } catch (error) {
        await transaction.rollback(); 
        
        console.log(error);
        return res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}


exports.getAllStaff = async (req, res) => {
    try {

        const allStaffs = await Staff.findAll();

        return res.status(200).json({ 
            success: true,
            message: 'All Staffs',
            data: allStaffs
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


/* exports.updateStaff = async (req, res) => {
    const transaction = await db.transaction();
    try {
        const { staffId, name, email, specializations, profilePicture, serviceIds } = req.body;

        // Basic field validation
        if (!staffId || !name || !email ||
            !Array.isArray(specializations) || specializations.length === 0 ||
            !Array.isArray(serviceIds) || serviceIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Check if staff exists
        const existingStaff = await Staff.findByPk(staffId);
        
        if (!existingStaff) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Staff not found'
            });
        }

        // Prepare update data
        const updatedStaffData = {
            name,
            email,
            specializations
        };
        
        // Add profilePicture if provided
        if(profilePicture) {
            updatedStaffData.profilePicture = profilePicture;
        }

        const uniqueServiceIds = [...new Set(serviceIds)];

        // Update staff data
        await Staff.update(updatedStaffData, { 
            where: { id: staffId }, 
            transaction 
        });

        // For service associations, first delete existing ones
        await StaffService.destroy({
            where: { staffId },
            transaction
        });

        // Then create new associations
        const staffServicesMappedData = uniqueServiceIds.map(serviceId => ({
            staffId,
            serviceId
        }));

        await StaffService.bulkCreate(staffServicesMappedData, { transaction });

        await transaction.commit();

        // Fetch updated staff with services for response
        const updatedStaff = await Staff.findByPk(staffId, {
            include: [{
                model: Services,
                through: { attributes: [] } // exclude junction table attributes
            }]
        });

        return res.status(200).json({ 
            success: true,
            message: 'Staff data updated successfully',
            data: updatedStaff
        });

    } catch (error) {
        await transaction.rollback();
        console.log(error);
        return res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
} */



exports.deleteStaff = async (req, res) => {
    const transaction = await db.transaction();
    try {
        const staffId = req.params.id;

        const staff = await Staff.findByPk(staffId);
        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff not found',
            });
        }

        await Staff.destroy({ where: { id: staffId }, transaction });
        await StaffService.destroy({ where: { staffId: staffId }, transaction });

        await transaction.commit();

        return res.status(200).json({
            success: true,
            message: 'Staff deleted successfully',
        });
    } catch (error) {
        await transaction.rollback();
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
};


exports.getStaffPassword = async (req, res) => {
    try {
        const staffId = req.query.id;

        const staff = await Staff.findByPk(staffId);
       
        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff not found',
            });
        }

        // Decrypt the password before sending it
        const decryptedPassword = decrypt(staff.password);

        return res.status(200).json({
            success: true,
            message: 'Staff password retrieved successfully',
            data: { password: decryptedPassword },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
};