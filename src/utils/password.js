import bcrypt from 'bcrypt';

export async function updatePassword(user, newPassword) {
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        await UserModel.findByIdAndUpdate(user._id, { password: hashedPassword });

        return true;
    } catch (error) {
        console.error('Error al actualizar la contraseña en la base de datos:', error);
        return false;
    }
}   