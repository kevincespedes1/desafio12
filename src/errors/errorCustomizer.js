
import errorMessages from './errors.js';

export const customizeError = (errorCode) => {
    return errorMessages[errorCode] || 'Ocurrió un error inesperado.';
};