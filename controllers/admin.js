import { getAllUsers, addData, deleteDataUser, getData, db } from "./data.js";
import { logOut, createUserEmailPassword, sendEmail } from "./global.js";
import { setDoc, collection, doc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const logoutBtn = document.getElementById("logout-btn");
const viewUsersBtn = document.getElementById("view-users-btn");
const createUserBtn = document.getElementById("create-user-btn");
const usersListElement = document.getElementById("users-list");
const deleteAccountBtn = document.getElementById("delete-account-btn");

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
      renderUsers(users);

      const ccInput = document.createElement("input");
      ccInput.type = "text";
      ccInput.placeholder = "Buscar por CC";
      const searchBtn = document.createElement("button");
      searchBtn.textContent = "Buscar";
      searchBtn.addEventListener("click", async () => {
        const ccValue = ccInput.value.trim().toLowerCase();
        const filteredUsers = users.filter(user => user.cc.toLowerCase().includes(ccValue));
        filteredUsers.sort((a, b) => (a.fullName > b.fullName) ? 1 : ((b.fullName > a.fullName) ? -1 : 0));
        renderUsers(filteredUsers);
      });

      usersListElement.appendChild(ccInput);
      usersListElement.appendChild(searchBtn);

      usersListElement.style.display = "block";
    } catch (error) {
      console.error("Error al obtener la lista de usuarios:", error);
    }
  });

  createUserBtn.addEventListener("click", async () => {
    const fullName = prompt("Ingrese el nombre del nuevo usuario:");
    const email = prompt("Ingrese el correo electrónico del nuevo usuario:");
    const password = prompt("Ingrese la contraseña del nuevo usuario:");
    const cc = prompt("Ingrese el valor del campo cc para el nuevo usuario:");
    try {
      const userCredential = await createUserEmailPassword(email, password);
      const user = userCredential.user;
      await sendEmail(user);
      await addData(user.uid, fullName, email, cc);
      alert("Usuario creado correctamente. Se ha enviado un correo de verificación.");
    } catch (error) {
      console.error("Error al crear usuario:", error);
      alert("Error al crear usuario. Consulte la consola para más detalles.");
    }
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

  async function edit_user(userId) {
    const userData = await getData(userId);
  
    const card = document.createElement("div");
    card.className = "card";
  
    const form = document.createElement("form");
  
    const nameLabel = document.createElement("label");
    nameLabel.textContent = "Nombre:";
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = userData.fullName || ''; // Si no hay nombre, dejar el campo vacío
  
    const emailLabel = document.createElement("label");
    emailLabel.textContent = "Correo electrónico:";
    const emailInput = document.createElement("input");
    emailInput.type = "email";
    emailInput.value = userData.email || ''; // Si no hay correo electrónico, dejar el campo vacío
  
    const ccLabel = document.createElement("label");
    ccLabel.textContent = "CC:";
    const ccInput = document.createElement("input");
    ccInput.type = "text";
    ccInput.value = userData.cc || ''; // Si no hay CC, dejar el campo vacío
  
    const updateButton = document.createElement("button");
    updateButton.textContent = "Actualizar";
    updateButton.addEventListener("click", async (e) => {
      e.preventDefault();
      const newData = {};
  
      if (nameInput.value.trim() !== '') {
        newData.fullName = nameInput.value;
      }
      if (emailInput.value.trim() !== '') {
        newData.email = emailInput.value;
      }
      if (ccInput.value.trim() !== '') {
        newData.cc = ccInput.value;
      }
  
      try {
        if (Object.keys(newData).length !== 0) {
          await setDoc(doc(collection(db, "users"), userId), newData, { merge: true });
          alert("Datos del usuario actualizados correctamente.");
          location.reload();
        } else {
          alert("No se han realizado cambios.");
        }
      } catch (error) {
        console.error("Error al actualizar datos del usuario:", error.message);
        alert("Error al actualizar datos del usuario. Consulte la consola para más detalles.");
      }
    });
  
    form.appendChild(nameLabel);
    form.appendChild(nameInput);
    form.appendChild(emailLabel);
    form.appendChild(emailInput);
    form.appendChild(ccLabel);
    form.appendChild(ccInput);
    form.appendChild(updateButton);
    card.appendChild(form);
  
    usersListElement.appendChild(card);
  }
  

  function renderUsers(users) {
    usersListElement.innerHTML = "";
    users.forEach((user) => {
      const listItem = document.createElement("li");
      listItem.textContent = `ID: ${user.id}, Nombre: ${user.fullName}, Email: ${user.email}, CC: ${user.cc}`;

      const editButton = document.createElement("button");
      editButton.textContent = "Editar";
      editButton.addEventListener("click", () => edit_user(user.id));
      listItem.appendChild(editButton);

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Eliminar";
      deleteButton.addEventListener("click", () => delete_data(user.id));
      listItem.appendChild(deleteButton);

      usersListElement.appendChild(listItem);
    });
  }
});
