const authService = require('../services/auth.service');
const jwt= require('jsonwebtoken');

const register = async( req,res)=>{
    try {
        const {ten_hien_thi, email, mat_khau} = req.body;
        
        if(!ten_hien_thi || !email || !mat_khau) {
            return res.status(400).json({message: 'Please provide all required fields'});
        }

        const newUser = await authService.registerUser({ten_hien_thi,email, mat_khau});
        res.status(201).json(newUser);
    } catch (error){
        res.status(500).json({message: error.message});
    }
};

const login = async(req, res) =>{
    try {
        const {identifier, mat_khau }= req.body;

        if(!identifier || !mat_khau) {
            return res.status(400).json({message: 'Please provide identifier and password'});
        }

        const user= await authService.loginUser({identifier, mat_khau});

           const token = jwt.sign({ ma_nguoi_dung: user.ma_nguoi_dung, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });
        res.status(200).json({ user, token });
    } catch (error){
        res.status(401).json({ message: error.message });
    }
};
module.exports = {
    register,
    login,
};