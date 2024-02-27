function toggleUserRole(userId) {
    fetch(`/api/users/premium/${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('No se pudo cambiar el rol del usuario');
        }
        return response.json();
    })
    .then(data => {
        console.log(data.message); 
    })
    .catch(error => {
        console.error('Error al cambiar el rol del usuario:', error);
    });
}