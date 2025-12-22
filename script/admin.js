let editingProductId = null;

// Cargar productos al iniciar
displayAdminProducts();

// Preview de imagen
document
  .getElementById("productImage")
  .addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        const preview = document.getElementById("imagePreview");
        preview.innerHTML = `<img src="${event.target.result}" alt="Preview">`;
      };
      reader.readAsDataURL(file);
    }
  });

// Manejar envío del formulario
document.getElementById("productForm").addEventListener("submit", function (e) {
  e.preventDefault();
  saveProduct();
});

function saveProduct() {
  const nameElement = document.getElementById("productName");
  const priceElement = document.getElementById("productPrice");
  const categoryElement = document.getElementById("productCategory");
  const linkElement = document.getElementById("productLink");
  const imageElement = document.getElementById("productImage");
  const productIdElement = document.getElementById("productId");

  if (
    !nameElement || !priceElement || !categoryElement || !linkElement || !imageElement || !productIdElement) {
    alert('Por favor completa todos los campos obligatorios');
    return;
  }

  const name = nameElement.value;
  const price = priceElement.value;
  const category = categoryElement.value;
  const link = linkElement.value;
  const imageFile = imageElement.files[0];
  const productId = productIdElement.value || null;

  // Validaciones
  if (!name || !price || !category || !link) {
    alert("Por favor completa todos los campos obligatorios");
    return;
  }

  // Si estamos editando y no hay nueva imagen, mantener la anterior
  if (editingProductId && !imageFile) {
    const products = getProducts();
    const existingProduct = products.find((p) => p.id === editingProductId);
    const product = {
      id: editingProductId,
      name: name,
      price: price,
      category: category,
      image: existingProduct.image,
      link: link,
    };
    updateProduct(editingProductId, product);
    resetForm();
    displayAdminProducts();
    return;
  }

  // Si hay nueva imagen
  if (imageFile) {
    const reader = new FileReader();
    reader.onload = function (event) {
      const product = {
        id: editingProductId || Date.now().toString(),
        name: name,
        price: price,
        category: category,
        image: event.target.result,
        link: link,
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
    };
    reader.readAsDataURL(imageFile);
  } else if (!editingProductId) {
    alert("Por favor selecciona una imagen para el producto");
  }
}

function editProduct(id) {
  const products = getProducts();
  const product = products.find((p) => p.id === id);

  if (product) {
    editingProductId = id;
    document.getElementById("productId").value = id;
    document.getElementById("productName").value = product.name;
    document.getElementById("productPrice").value = product.price;
    document.getElementById("productCategory").value = product.category;
    document.getElementById("productLink").value = product.link;
    document.getElementById("imagePreview").innerHTML = `<img src="${product.image}" alt="Preview">`;
    document.getElementById("formTitle").textContent = "Editar Producto";
    document.querySelector(".admin-form-container").scrollIntoView({ behavior: "smooth" });
  }
}

function confirmDelete(id) {
  if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
    deleteProduct(id);
    displayAdminProducts();
    alert("Producto eliminado exitosamente");
  }
}

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
