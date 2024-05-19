import { getAllUsers, addData, deleteDataUser } from "./data.js"; // Importa las funciones para obtener usuarios, agregar y eliminar datos
import { logOut, createUserEmailPassword, sendEmail } from "./global.js"; // Importa las funciones de cierre de sesión, creación de usuario y envío de correo

const logoutBtn = document.getElementById("logout-btn");
const viewUsersBtn = document.getElementById("view-users-btn");
const createUserBtn = document.getElementById("create-user-btn");
const usersListElement = document.getElementById("users-list");

logoutBtn.addEventListener("click", () => {
  logOut().then(() => {
    window.location.href = "../index.html";
  });
});

document.addEventListener("DOMContentLoaded", () => {
  usersListElement.style.display = "none";

  viewUsersBtn.addEventListener("click", async () => {
    try {
      usersListElement.innerHTML = "";
      const users = await getAllUsers();
      users.forEach((user) => {
        const listItem = document.createElement("li");
        listItem.textContent = `ID: ${user.id}, Nombre: ${user.fullName}, Email: ${user.email}`;
        
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Eliminar";
        deleteButton.addEventListener("click", () => delete_data(user.id));
        listItem.appendChild(deleteButton);

        usersListElement.appendChild(listItem);
      });
      usersListElement.style.display = "block";
    } catch (error) {
      console.error("Error al obtener la lista de usuarios:", error);
    }
  });

  createUserBtn.addEventListener("click", async () => {
    const fullName = prompt("Ingrese el nombre del nuevo usuario:");
    const email = prompt("Ingrese el correo electrónico del nuevo usuario:");
    const password = prompt("Ingrese la contraseña del nuevo usuario:");
    try {
      const userCredential = await createUserEmailPassword(email, password);
      const user = userCredential.user;
      await sendEmail(user);
      await addData(user.uid, fullName, email);
      alert("Usuario creado correctamente. Se ha enviado un correo de verificación.");
    } catch (error) {
      console.error("Error al crear usuario:", error);
      alert("Error al crear usuario. Consulte la consola para más detalles.");
    }
  });
});

async function delete_data(docUserId) {
  console.log("Tratando de borrar");

  try {
    const action = deleteDataUser(docUserId);
    const borrar = await action;
    alert("Usuario eliminado.");
    location.reload();
  } catch (error) {
    console.error("Error al eliminar datos de usuario:", error.code);

    switch (error.code) {
      case 'permission-denied':
        alert("Permisos insuficientes para eliminar el usuario.");
        break;
      case 'not-found':
        alert("Usuario no encontrado.");
        break;
      default:
        alert("Error al eliminar usuario: " + error.message);
        break;
    }
  }
}

window.addEventListener("DOMContentLoaded", () => {
  view_users();
});
