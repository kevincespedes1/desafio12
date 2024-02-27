import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const secretKey = process.env.JWT_SECRET_KEY || 'secret-key1234';

const TOKEN_EXPIRATION_MINUTES = 60;

export default function generateToken(email) {
    const expirationSeconds = TOKEN_EXPIRATION_MINUTES * 60;
    const token = crypto.randomBytes(32).toString('hex');
    const jwtToken = jwt.sign({ email, token }, secretKey, { expiresIn: expirationSeconds });
    return jwtToken;
}
