
const socket = io();

socket.on('messages', (data) => {
  const divChat = document.getElementById('chat');
  divChat.innerHTML = '';
  data.forEach((message) => {
    divChat.innerHTML += `
      <p><b>${message.user}:</b> ${message.message}</p>`
  })
});

const user = document.getElementById('user');
const rol = document.getElementById('rol');
const message = document.getElementById('message');
const buttonChat = document.getElementById('chat-button');
const formChat = document.getElementById('chatForm');


buttonChat.addEventListener('click', (e) => {
  e.preventDefault();
  const newMessage = {
    user: user.value,
    message: message.value,
    rol: rol.value
  };

  const isAdmin = (newMessage.rol === 'admin');

  if (!newMessage.message) {
    const errorMessage = 'Debe escribir algo para poder enviar el mensaje.';
    Swal.fire({
      icon: 'error',
      title: 'Mensaje vacío',
      text: errorMessage,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    });
    return;
  };

  if (isAdmin) {
    const errorMessage = 'Usted es administrador y no puede enviar mensajes.';
    Swal.fire({
      icon: 'error',
      title: 'Acceso restringido',
      text: errorMessage,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    });
    return;
  };

  socket.emit('newMessage', newMessage);
  formChat.reset();
});


const role = document.getElementById('role');
const addProduct = document.getElementById('addProductButton');
const formAddProduct = document.getElementById('addProduct');
const email = document.getElementById('email');
const deleteProduct = document.getElementById('deleteProductButton');
const formDeleteProduct = document.getElementById('deleteProduct');
const roles = document.getElementById('roles');

addProduct.addEventListener('click', (e) => {
  e.preventDefault();
  const userEmail = email.value
  const userRole = role.value; 
  if (userRole !== 'premium' && userRole !== 'admin') {
    Swal.fire({
      icon: 'error',
      title: 'Acceso denegado',
      text: 'No tienes permisos para crear productos',
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    });
    return;
  }
  let title = document.getElementById('title').value;
  let description = document.getElementById('description').value;
  let code = document.getElementById('code').value;
  let price = document.getElementById('price').value;
  let stock = document.getElementById('stock').value;
  let thumbnail = document.getElementById('thumbnail').value;
  let category = document.getElementById('category').value;
  if (!title || !description || !code || !price || !stock || !category) {
    Swal.fire({
      icon: 'error',
      title: 'Información incompleta',
      text: 'Alguno de los campos se encuentra vacío, por favor completar',
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    });
    return;
  }

  const newProduct = {
    title: title,
    description: description,
    code: code,
    price: price,
    stock: stock,
    category: category,
    thumbnail: thumbnail || 'Sin imagen',
    owner: userEmail 
  };
  socket.emit('addProduct', newProduct);
  Swal.fire({
    icon: 'success',
    title: 'Producto Agregado',
    text: `El producto ${newProduct.title} fue agregado exitosamente`,
    position: 'top-end',
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
  });
  formAddProduct.reset();
});


deleteProduct.addEventListener('click', async (e) => {
  e.preventDefault();
const userRoles =document.getElementById('roles')
const usRol = userRoles.value 
  const userEmail = email.value; 
  const productId = document.getElementById('id').value;

  try {
    const response = await fetch(`/api/products/${productId}`);
    const data = await response.json();

    const productOwnerEmail = data.owner; 

    if (userEmail === productOwnerEmail || usRol.includes('admin') ) {
      Swal.fire({
        title: '¿Estás seguro?',
        text: '¿Quieres eliminar este producto?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then(async (result) => {
        if (result.isConfirmed) {
          const deleteResponse = await fetch(`/api/products/${productId}`, {
            method: 'DELETE'
          });

          if (deleteResponse.ok) {
            Swal.fire({
              icon: 'success',
              title: 'Producto eliminado',
              text: 'El producto ha sido eliminado exitosamente',
              position: 'top-end',
              showConfirmButton: false,
              timer: 2000,
              timerProgressBar: true
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error al eliminar el producto',
              text: 'Hubo un error al eliminar el producto, por favor intenta de nuevo',
              position: 'top-end',
              showConfirmButton: false,
              timer: 2000,
              timerProgressBar: true
            });
          }
        }
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Acceso denegado',
        text: 'No tienes permisos para eliminar este producto',
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      });
    }
  } catch (error) {
    console.error('Error al obtener los detalles del producto:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error al obtener los detalles del producto',
      text: 'Hubo un error al obtener los detalles del producto, por favor intenta de nuevo',
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true
    });
  }
});


