
// this middleware checks that the session has the user id 

const requireLogin = (req , res , next) => {
    if(!req.session.uesrId){
        return res.status(401).json({
            success:false,
            message:"Authentication required"
        });
    }
    next();
};

module.exports = requireLogin;