const{ getSession}= require('../config/neo4j');
const bcrypt = require('bcrypt');

//  
const registerUser = async (userData) => {
    const {ten_hien_thi, email, mat_khau} = userData;
    const session = getSession();
    try{
        // check if user already exist
        const userExistResult = await session.run(
            'MATCH (u:NguoiDung) WHERE u.email = $email OR u.ten_hien_thi = $ten_hien_thi RETURN u',
            {email,ten_hien_thi}
        );

        if(userExistResult.records.length > 0){
            throw new Error('User with this email or username already exists');
        }

        // hash password
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(mat_khau,salt);

        //create new user
        const result = await session.run(
           `CREATE (u:NguoiDung {
                ma_nguoi_dung: randomUUID(),
                email: $email,
                ten_hien_thi: $ten_hien_thi,
                mat_khau: $mat_khau,
                anh_dai_dien: '',
                trang_thai: 'hoat_dong',
                ngay_tao: datetime()
            }) RETURN u`,
            {
                email,
                ten_hien_thi,
                mat_khau: hashPassword
            } 
        );
        const newUser = result.records[0].get('u').properties;
        delete newUser.mat_khau;
        return newUser;
    } finally {
        await session.close();
    }
};

const loginUser = async (loginData)=>{
    const {identifier, mat_khau} = loginData;
    const session = getSession();
    try {
        const result = await session.run(
            'MATCH (u:NguoiDung) WHERE u.email = $identifier OR u.ten_hien_thi = $identifier RETURN u',
            {identifier}
        );

        if(result.records.length === 0) {
            throw new Error('Invalid credentials.');
        }
        
        const user = result.records[0].get('u').properties;
        console.log(user)
        const validPassword = await bcrypt.compare(mat_khau, user.mat_khau);

        if (!validPassword) {
            throw new Error ('Invalid credentials.')
        }

        delete user.mat_khau;
        return user;
    } finally {
        await session.close();
    }
};

module.exports = {
    registerUser,
    loginUser,
};