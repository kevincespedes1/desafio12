document.querySelectorAll('.addToCartButton').forEach(button => {
    button.addEventListener('click', async (event) => {
        try {
            const productId = event.target.dataset.productId;
            const userEmail = email.value;

            const quantity = 1;


            const response = await fetch(`/api/products/${productId}`);
            const data = await response.json();
            const productOwnerEmail = data.owner;

            if (userEmail === productOwnerEmail) {
                Swal.fire({
                    icon: 'error',
                    title: 'Acceso denegado',
                    text: 'Los usuarios premium no pueden agregar su propio producto al carrito',
                    position: 'center',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                });
                return;
            }

            const addToCartResponse = await fetch(`/api/carts/add/${productId}/${quantity}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const addToCartData = await addToCartResponse.json();

            if (addToCartData.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Producto agregado al carrito',
                    text: 'El producto se agregó al carrito correctamente',
                    showCancelButton: true,
                    confirmButtonText: 'Añadir',
                    cancelButtonText: 'Cancelar',
                }).then((result) => {
                    if (result.isConfirmed) {
                        Swal.fire('Producto añadido', 'El producto fue añadido correctamente al carrito', 'success');
                    } else if (result.dismiss === Swal.DismissReason.cancel) {
                        Swal.fire('Producto no añadido', 'El producto no fue añadido al carrito', 'error');
                    }
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Acceso denegado',
                    text: 'No tienes permisos para agregar productos a tu carrito',
                    position: 'center',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                });
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
});
