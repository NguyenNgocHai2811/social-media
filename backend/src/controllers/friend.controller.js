const friendService = require('../services/friend.service');

const getFriendshipStatus = async(req , res )=> {
    try {
        const status = await friendService.getFriendshipStatus(req.user.ma_nguoi_dung, req.params.userId);
        res.json(status);
    } catch (error) {
        res.status(500).json({message: error.message})
    }
};

const sendFriendRequest = async(req , res)=>{
    try {
        await friendService.sendFriendRequest(req.user.ma_nguoi_dung, req.params.userId);
        res.status(201).json({message: 'Friend request sent successfully'});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

const cancelFriendRequest = async(req , res )=>{
    try{
        await friendService.cancelFriendRequest(req.user.ma_nguoi_dung, req.params.userId);
        res.json({message: 'Friend request accepted successfully'});

    }catch(err){
        res.status(500).json({message: err.message});
    }
}

const getFriendRequest = async (req , res )=>{
    try {
        const request = await friendService.getFriendRequest(req.user.ma_nguoi_dung);
        res.json(request);
    } catch(err){
        res.status(500).json({message: err.message});
    }
};

const acceptFriendRequest = async (req, res ) =>{
    try {
        await friendService.acceptFriendRequest(req.user.ma_nguoi_dung, req.params.userId);
        res.json({message: 'Friend request accepted successfully'});
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
};

const rejectFriendRequest =async (req, res) =>{
    try {
        await friendService.acceptFriendRequest(req.user.ma_nguoi_dung,req.params.userId);
        res.json({message:'Friend request rejected successfully'});
    } catch(err){
        res.status(500).json({message: err.message});
    }
};
const unFriendUser = async (req ,res )=>{
    try{
        await friendService.unFriendUser(req.user.ma_nguoi_dung, req.params.userId);
        res.json({message:'User unfriend successfully'});
    } catch (err){
        res.status(500).json({message: err.message});
    }
}
module.exports = {
    getFriendshipStatus,
    getFriendRequest,
    sendFriendRequest,
    cancelFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    unFriendUser
}