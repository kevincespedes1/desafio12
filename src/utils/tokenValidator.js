import jwt from 'jsonwebtoken';

const secretKey = 'secret-key1234';

/**
 * Función para validar un token JWT.
 * @param {string} token 
 * @returns {boolean}
 */
export function validateToken(token) {
    try {
        const decoded = jwt.verify(token, secretKey);
        const userEmail = decoded.email;

        console.log('Correo electrónico:', userEmail);

        const expirationTime = decoded.exp;
        const currentTime = Math.floor(Date.now() / 1000); 
        const expirationLimit = 60 * 60; 
        if (expirationTime < currentTime || (expirationTime - currentTime) > expirationLimit) {
            return false; 
        }
        return true;
    } catch (error) {
        return false;
    }
}
