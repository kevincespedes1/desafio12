const rolesPermissions = {
    usuario: ['read', 'addToCart', 'removeFromCart', 'purchase', 'sendMessage'],
    premium: ['read', 'create','delete', 'addToCart', 'removeFromCart', 'purchase', 'sendMessage'],
    admin: ['read', 'create', 'delete']
};
function checkPermissions(permission) {
    return (req, res, next) => {
        const userRole = req.session.user.rol; 
        
        if (rolesPermissions[userRole] && rolesPermissions[userRole].includes(permission)) {
            next(); 
        } else {
            res.status(403).json({ success: false, message: 'Acceso no autorizado' });
        }
    };
}

export default checkPermissions;