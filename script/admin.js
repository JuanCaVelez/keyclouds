import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  displayAdminProducts
} from "./products.js";

import categoryService from "./categories.js";

let editingProductId = null;
let editingCategoryId = null;

/* ==========================
   INICIALIZACIÓN
   ========================== */
document.addEventListener("DOMContentLoaded", () => {
  displayAdminProducts();
  loadCategorySelect();
  displayAdminCategories();
});

/* ==========================
   ENVÍO DEL FORMULARIO DE PRODUCTO
   ========================== */
document.getElementById("productForm").addEventListener("submit", function (e) {
  e.preventDefault();
  saveProduct();
});

/* ==========================
   GUARDAR / EDITAR PRODUCTO
   ========================== */
// EN saveProduct():
async function saveProduct() {
  const id = document.getElementById("productId").value;
  const name = document.getElementById("productName").value.trim();
  
  // Guardamos un array con todas las categorías marcadas
  const categories = getSelectedCategories(); 
  
  const price = document.getElementById("productPrice").value.trim();
  const link = document.getElementById("productLink").value.trim();
  const images = (window.productImages || []).filter(url => url !== "");

  if (!name || categories.length === 0 || !price || !link) {
    alert("Completa todos los campos obligatorios y selecciona al menos una categoría.");
    return;
  }

  if (images.length === 0) {
    alert("Debes subir al menos una imagen del producto.");
    return;
  }

  // Ahora la propiedad se llama 'categories' (Array)
  const product = { name, categories, price, images, link };

  if (id) {
    await updateProduct(id, product);
  } else {
    await addProduct(product);
  }

  resetForm();
  await displayAdminProducts();
  alert("Producto guardado correctamente ✅");
}
/* ==========================
   EDITAR PRODUCTO
   ========================== */
async function editProduct(id) {
  const products = await getProducts();
  const product = products.find(p => p.id === id);
  if (!product) return;

  editingProductId = id;

  document.getElementById("productId").value = product.id;
  document.getElementById("productName").value = product.name;
  
  // Soporta tanto el formato nuevo (array) como los viejos (string)
  const productCats = product.categories || (product.category ? [product.category] : []);
  setSelectedCategories(productCats);
  
  document.getElementById("productPrice").value = product.price;
  document.getElementById("productLink").value = product.link;

  // Cargar imágenes existentes en los slots
  window.productImages = ['', '', ''];
  (product.images || []).forEach((url, index) => {
    if (index < 3) {
      window.setImageSlot(index, url);
    }
  });

  document.getElementById("formTitle").textContent = "Editar Producto";
  document.querySelector(".admin-form-container").scrollIntoView({ behavior: "smooth" });
}


/* ==========================
   ELIMINAR PRODUCTO
   ========================== */
async function confirmDelete(id) {
  if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) return;
  await deleteProduct(id);
  await displayAdminProducts();
  alert("Producto eliminado exitosamente");
}

/* ==========================
   CANCELAR / RESET
   ========================== */
function cancelEdit() {
  resetForm();
}

function resetForm() {
  editingProductId = null;
  document.getElementById("productForm").reset();
  document.getElementById("productId").value = "";
  document.getElementById("formTitle").textContent = "Agregar Nuevo Producto";

  // Limpiar slots de imágenes
  window.productImages = ['', '', ''];
  [0, 1, 2].forEach(i => {
    if (window.removeImage) window.removeImage(i);
  });
}

/* ==========================
   CARGAR CATEGORÍAS EN CHECKBOXES
   ========================== */
async function loadCategorySelect() {
  const container = document.getElementById("productCategories");
  if (!container) return;

  const previouslySelected = getSelectedCategories();
  const categories = await categoryService.getAll();
  container.innerHTML = "";

  categories.forEach(category => {
    const label = document.createElement("label");
    label.className = "category-option";
    label.style.display = "inline-flex";
    label.style.alignItems = "center";
    label.style.marginRight = "15px";
    label.style.gap = "5px";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.name = "productCategory";
    input.value = category.name;

    const span = document.createElement("span");
    span.textContent = category.name;

    label.append(input, span);
    container.appendChild(label);
  });

  setSelectedCategories(previouslySelected);
}

function getSelectedCategories() {
  return [...document.querySelectorAll('input[name="productCategory"]:checked')]
    .map(input => input.value);
}

function setSelectedCategories(categories) {
  document.querySelectorAll('input[name="productCategory"]').forEach(input => {
    input.checked = categories.includes(input.value);
  });
}
/* ==========================
   CRUD DE CATEGORÍAS
   ========================== */

// Envío del formulario de categoría
document.getElementById("categoryForm").addEventListener("submit", function (e) {
  e.preventDefault();
  saveCategory();
});

async function saveCategory() {
  const input = document.getElementById("categoryName");
  const name = input.value.trim();

  if (!name) {
    alert("Escribe un nombre de categoría");
    return;
  }

  const duplicate = await categoryService.isDuplicate(name, editingCategoryId);
  if (duplicate) {
    alert("Ya existe una categoría con ese nombre");
    return;
  }

  if (editingCategoryId) {
    const ok = await categoryService.update(editingCategoryId, name);
    if (!ok) {
      alert("No se pudo actualizar la categoría. Revisa la consola (F12) para más detalles.");
      return;
    }
    editingCategoryId = null;
    document.getElementById("categoryFormTitle").textContent = "Agregar Categoría";
    document.getElementById("categorySubmitBtn").textContent = "Agregar";
    document.getElementById("categoryCancelBtn").style.display = "none";
  } else {
    const newId = await categoryService.add(name);
    if (!newId) {
      alert("No se pudo guardar la categoría. Revisa la consola (F12) para más detalles.");
      return;
    }
  }

  input.value = "";
  await displayAdminCategories();
  await loadCategorySelect();
}

async function displayAdminCategories() {
  const container = document.getElementById("adminCategoriesList");
  if (!container) return;

  const categories = await categoryService.getAll();

  if (categories.length === 0) {
    container.innerHTML = '<p class="no-products-admin">No hay categorías registradas aún.</p>';
    return;
  }

  container.innerHTML = categories.map(category => `
    <div class="admin-category-item">
      <span class="admin-category-name">${category.name}</span>
      <div class="admin-category-actions">
        <button onclick="editCategory('${category.id}', '${category.name.replace(/'/g, "\\'")}')" class="btn-edit">
          <i class="fa-solid fa-edit"></i>
        </button>
        <button onclick="confirmDeleteCategory('${category.id}')" class="btn-delete">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>
  `).join("");
}

function editCategory(id, name) {
  editingCategoryId = id;
  document.getElementById("categoryName").value = name;
  document.getElementById("categoryFormTitle").textContent = "Editar Categoría";
  document.getElementById("categorySubmitBtn").textContent = "Guardar";
  document.getElementById("categoryCancelBtn").style.display = "inline-block";
  document.getElementById("categoryName").focus();
}

function cancelEditCategory() {
  editingCategoryId = null;
  document.getElementById("categoryName").value = "";
  document.getElementById("categoryFormTitle").textContent = "Agregar Categoría";
  document.getElementById("categorySubmitBtn").textContent = "Agregar";
  document.getElementById("categoryCancelBtn").style.display = "none";
}

async function confirmDeleteCategory(id) {
  if (!confirm("¿Estás seguro de que deseas eliminar esta categoría? Los productos que ya la usan conservarán el nombre, pero dejará de aparecer en el menú.")) return;
  await categoryService.remove(id);
  await displayAdminCategories();
  await loadCategorySelect();
}

// Exponer funciones al HTML
window.editProduct = editProduct;
window.confirmDelete = confirmDelete;
window.cancelEdit = cancelEdit;
window.editCategory = editCategory;
window.cancelEditCategory = cancelEditCategory;
window.confirmDeleteCategory = confirmDeleteCategory;