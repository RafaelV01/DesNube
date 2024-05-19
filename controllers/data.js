import { app } from "./global.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc // Importa deleteDoc para eliminar documentos
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const db = getFirestore(app);

export const getAllUsers = async () => {
  const usersSnapshot = await getDocs(collection(db, "users"));
  const usersList = [];
  usersSnapshot.forEach((doc) => {
    usersList.push(doc.data());
  });
  return usersList;
};

export const addData = async (id, fullName, email) => 
  await setDoc(doc(collection(db, "users"), id), {
    id: id,
    fullName: fullName,
    email: email,
    adm: false,
  });

export const getData = async (id) => await getDoc(doc(db, "users", id));

export const deleteDataUser = async (id) => 
  await deleteDoc(doc(db, "users", id));
