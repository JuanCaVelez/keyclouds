let editingProductId = null;

/* ==========================
   INICIALIZACIÓN
   ========================== */
document.addEventListener("DOMContentLoaded", () => {
  displayAdminProducts();
  loadCategorySelect();
});

/* ==========================
   PREVIEW DE IMÁGENES (HASTA 3)
   ========================== */
document.getElementById("productImage").addEventListener("change", function (e) {
  const files = Array.from(e.target.files).slice(0, 3);
  const preview = document.getElementById("imagePreview");
  preview.innerHTML = "";

  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = function (event) {
      preview.innerHTML += `
        <img src="${event.target.result}"
             alt="Preview"
             style="width:80px;height:80px;object-fit:cover;margin:5px;border-radius:6px;">
      `;
    };
    reader.readAsDataURL(file);
  });
});

/* ==========================
   ENVÍO DEL FORMULARIO
   ========================== */
document.getElementById("productForm").addEventListener("submit", function (e) {
  e.preventDefault();
  saveProduct();
});

/* ==========================
   GUARDAR PRODUCTO
   ========================== */
function saveProduct() {
  const nameElement = document.getElementById("productName");
  const priceElement = document.getElementById("productPrice");
  const categoryElement = document.getElementById("productCategory");
  const linkElement = document.getElementById("productLink");
  const imageElement = document.getElementById("productImage");
  const productIdElement = document.getElementById("productId");

  if (
    !nameElement ||
    !priceElement ||
    !categoryElement ||
    !linkElement ||
    !imageElement ||
    !productIdElement
  ) {
    alert("Por favor completa todos los campos obligatorios");
    return;
  }

  const name = nameElement.value.trim();
  const price = priceElement.value.trim();
  const category = categoryElement.value;
  const link = linkElement.value.trim();
  const imageFiles = Array.from(imageElement.files).slice(0, 3);

  if (!name || !price || !category || !link) {
    alert("Por favor completa todos los campos obligatorios");
    return;
  }

  /* ==========================
     EDITAR SIN NUEVAS IMÁGENES
     ========================== */
  if (editingProductId && imageFiles.length === 0) {
    const products = getProducts();
    const existingProduct = products.find(p => p.id === editingProductId);

    const product = {
      id: editingProductId,
      name,
      price,
      category,
      images: existingProduct.images,
      link,
    };

    updateProduct(editingProductId, product);
    resetForm();
    displayAdminProducts();
    return;
  }

  /* ==========================
     GUARDAR CON NUEVAS IMÁGENES
     ========================== */
  if (imageFiles.length > 0) {
    const images = [];
    let loaded = 0;

    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = function (event) {
        images.push(event.target.result);
        loaded++;

        if (loaded === imageFiles.length) {
          const product = {
            id: editingProductId || Date.now().toString(),
            name,
            price,
            category,
            images,
            link,
          };

          if (editingProductId) {
            updateProduct(editingProductId, product);
            alert("Producto actualizado exitosamente");
          } else {
            addProduct(product);
            alert("Producto agregado exitosamente");
          }

          resetForm();
          displayAdminProducts();
        }
      };
      reader.readAsDataURL(file);
    });
  } else if (!editingProductId) {
    alert("Por favor selecciona al menos una imagen");
  }
}

/* ==========================
   EDITAR PRODUCTO
   ========================== */
function editProduct(id) {
  const products = getProducts();
  const product = products.find(p => p.id === id);

  if (!product) return;

  editingProductId = id;
  document.getElementById("productId").value = id;
  document.getElementById("productName").value = product.name;
  document.getElementById("productPrice").value = product.price;
  document.getElementById("productCategory").value = product.category;
  document.getElementById("productLink").value = product.link;

  const preview = document.getElementById("imagePreview");
  preview.innerHTML = "";

  if (product.images) {
    product.images.forEach(img => {
      preview.innerHTML += `
        <img src="${img}"
             alt="Preview"
             style="width:80px;height:80px;object-fit:cover;margin:5px;border-radius:6px;">
      `;
    });
  }

  document.getElementById("formTitle").textContent = "Editar Producto";
  document.querySelector(".admin-form-container")
    .scrollIntoView({ behavior: "smooth" });
}

/* ==========================
   ELIMINAR PRODUCTO
   ========================== */
function confirmDelete(id) {
  if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
    deleteProduct(id);
    displayAdminProducts();
    alert("Producto eliminado exitosamente");
  }
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
  document.getElementById("imagePreview").innerHTML = "";
  document.getElementById("formTitle").textContent = "Agregar Nuevo Producto";
}

/* ==========================
   CARGAR CATEGORÍAS
   ========================== */
function loadCategorySelect() {
  const select = document.getElementById("productCategory");
  if (!select) return;

  select.innerHTML = `<option value="">Selecciona una categoría</option>`;

  const categories = getCategories();
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    select.appendChild(option);
  });
}
