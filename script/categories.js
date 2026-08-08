import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

/* ==========================
   CategoryService
   CRUD de categorías sobre Firestore
   ========================== */
class CategoryService {
  constructor(db, collectionName = "categories") {
    this.db = db;
    this.collectionName = collectionName;
  }

  /**
   * Obtiene todas las categorías ordenadas por nombre.
   * @returns {Promise<Array<{id: string, name: string}>>}
   */
  async getAll() {
    try {
      const q = query(collection(this.db, this.collectionName), orderBy("name"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.error("Error leyendo categorías:", e);
      return [];
    }
  }

  /**
   * Agrega una nueva categoría.
   * @param {string} name
   * @returns {Promise<string|null>} id del nuevo documento, o null si falló
   */
  async add(name) {
    try {
      const docRef = await addDoc(collection(this.db, this.collectionName), { name });
      return docRef.id;
    } catch (e) {
      console.error("Error agregando categoría:", e);
      return null;
    }
  }

  /**
   * Actualiza el nombre de una categoría existente.
   * @param {string} id
   * @param {string} name
   */
  async update(id, name) {
    try {
      const ref = doc(this.db, this.collectionName, id);
      await updateDoc(ref, { name });
      return true;
    } catch (e) {
      console.error("Error actualizando categoría:", e);
      return false;
    }
  }

  /**
   * Elimina una categoría por id.
   * @param {string} id
   */
  async remove(id) {
    try {
      await deleteDoc(doc(this.db, this.collectionName, id));
      return true;
    } catch (e) {
      console.error("Error eliminando categoría:", e);
      return false;
    }
  }

  /**
   * Verifica si ya existe una categoría con ese nombre (case-insensitive).
   * @param {string} name
   * @param {string|null} excludeId - id a excluir de la comprobación (útil al editar)
   * @returns {Promise<boolean>}
   */
  async isDuplicate(name, excludeId = null) {
    const categories = await this.getAll();
    return categories.some(
      c => c.name.toLowerCase() === name.toLowerCase() && c.id !== excludeId
    );
  }
}

// Instancia única lista para usar en toda la app
const categoryService = new CategoryService(db);

export default categoryService;
export { CategoryService };