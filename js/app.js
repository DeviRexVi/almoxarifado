/* =====================================================
   ALMOXARIFADO TECNOLÓGICO 2.0
   Sistema de gerenciamento de estoque

   Tecnologias:
   - JavaScript
   - HTML
   - CSS
   - LocalStorage
===================================================== */

/* =====================================================
   CONFIGURAÇÕES
===================================================== */

const STORAGE_KEY = "almoxarifado_tecnologico_v4";

const THEME_KEY = "almoxarifado_theme";

const DEFAULT_CATEGORIES = [
  "Computadores",
  "Periféricos",
  "Cabos e Adaptadores",
  "Redes",
  "Componentes",
  "Armazenamento",
  "Energia",
  "Outros",
];

/* =====================================================
   ESTADO DO SISTEMA
===================================================== */

let state = {
  products: [],

  categories: [...DEFAULT_CATEGORIES],

  loans: [],

  history: [],
};

/* =====================================================
   INICIALIZAÇÃO
===================================================== */

document.addEventListener("DOMContentLoaded", initialize);

function initialize() {
  loadData();

  setupNavigation();

  setupForms();

  setupFilters();

  setupSystemEvents();

  setupTheme();

  renderAll();
}

/* =====================================================
   LOCAL STORAGE
===================================================== */

function loadData() {
  const savedData = localStorage.getItem(STORAGE_KEY);

  if (!savedData) {
    saveData();

    return;
  }

  try {
    const parsed = JSON.parse(savedData);

    state = {
      products: parsed.products || [],

      categories: parsed.categories?.length
        ? parsed.categories
        : [...DEFAULT_CATEGORIES],

      loans: parsed.loans || [],

      history: parsed.history || [],
    };
  } catch (error) {
    console.error("Erro ao carregar dados:", error);

    showToast("Não foi possível carregar os dados.");
  }
}

function saveData() {
  localStorage.setItem(
    STORAGE_KEY,

    JSON.stringify(state),
  );
}

/* =====================================================
   NAVEGAÇÃO
===================================================== */

function setupNavigation() {
  document.querySelectorAll("[data-section]").forEach((button) => {
    button.addEventListener("click", () => {
      const sectionId = button.dataset.section;

      if (!document.getElementById(sectionId)) {
        return;
      }

      showSection(sectionId);
    });
  });
}

function showSection(sectionId) {
  document.querySelectorAll(".section").forEach((section) => {
    section.classList.remove("active");
  });

  document.querySelectorAll(".nav-button").forEach((button) => {
    button.classList.remove("active");
  });

  const section = document.getElementById(sectionId);

  if (section) {
    section.classList.add("active");
  }

  const navButton = document.querySelector(
    `.nav-button[data-section="${sectionId}"]`,
  );

  if (navButton) {
    navButton.classList.add("active");
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

/* =====================================================
   FORMULÁRIOS
===================================================== */

function setupForms() {
  const productForm = document.getElementById("product-form");

  const categoryForm = document.getElementById("category-form");

  const loanForm = document.getElementById("loan-form");

  productForm.addEventListener("submit", handleProductSubmit);

  categoryForm.addEventListener("submit", addCategory);

  loanForm.addEventListener("submit", handleLoanSubmit);

  document.getElementById("cancel-edit").addEventListener("click", cancelEdit);

  document
    .getElementById("close-modal")
    .addEventListener("click", closeLoanModal);

  document
    .getElementById("cancel-loan")
    .addEventListener("click", closeLoanModal);
}

/* =====================================================
   CATEGORIAS
===================================================== */

function renderCategories() {
  const categorySelect = document.getElementById("category");

  const categoryFilter = document.getElementById("category-filter");

  const categoryList = document.getElementById("category-list");

  const currentCategory = categorySelect.value;

  const currentFilter = categoryFilter.value;

  categorySelect.innerHTML = "";

  state.categories.forEach((category) => {
    const option = document.createElement("option");

    option.value = category;

    option.textContent = category;

    categorySelect.appendChild(option);
  });

  if (state.categories.includes(currentCategory)) {
    categorySelect.value = currentCategory;
  }

  categoryFilter.innerHTML = `

        <option value="">
            Todas as categorias
        </option>

    `;

  state.categories.forEach((category) => {
    const option = document.createElement("option");

    option.value = category;

    option.textContent = category;

    categoryFilter.appendChild(option);
  });

  if (state.categories.includes(currentFilter)) {
    categoryFilter.value = currentFilter;
  }

  categoryList.innerHTML = "";

  state.categories.forEach((category) => {
    const quantity = state.products.filter(
      (product) => product.category === category,
    ).length;

    const li = document.createElement("li");

    li.className = "category-item";

    li.innerHTML = `

            <span>
                🏷️ ${escapeHTML(category)}
            </span>

            <span class="category-count">
                ${quantity} produto(s)
            </span>

        `;

    categoryList.appendChild(li);
  });
}

function addCategory(event) {
  event.preventDefault();

  const input = document.getElementById("category-name");

  const name = input.value.trim();

  if (!name) {
    return;
  }

  const exists = state.categories.some(
    (category) => category.toLowerCase() === name.toLowerCase(),
  );

  if (exists) {
    showToast("Essa categoria já existe.");

    return;
  }

  state.categories.push(name);

  saveData();

  renderAll();

  input.value = "";

  showToast("Categoria adicionada com sucesso!");
}

/* =====================================================
   PRODUTOS
===================================================== */

function handleProductSubmit(event) {
  event.preventDefault();

  const editingId = document.getElementById("editing-id").value;

  const name = document.getElementById("name").value.trim();

  const code = document.getElementById("code").value.trim();

  const category = document.getElementById("category").value;

  const quantity = Number(document.getElementById("quantity").value);

  const minimum = Number(document.getElementById("minimum").value);

  const location = document.getElementById("location").value.trim();

  const description = document.getElementById("description").value.trim();

  if (quantity < 0 || minimum < 0) {
    showToast("Quantidade inválida.");

    return;
  }

  const duplicatedCode = state.products.find(
    (product) =>
      product.code.toLowerCase() === code.toLowerCase() &&
      product.id !== editingId,
  );

  if (duplicatedCode) {
    showToast("Já existe um produto com esse código.");

    return;
  }

  if (editingId) {
    editExistingProduct(editingId, {
      name,
      code,
      category,
      quantity,
      minimum,
      location,
      description,
    });
  } else {
    createProduct({
      name,
      code,
      category,
      quantity,
      minimum,
      location,
      description,
    });
  }
}

function createProduct(data) {
  const product = {
    id: generateId(),

    name: data.name,

    code: data.code,

    category: data.category,

    quantity: data.quantity,

    minimum: data.minimum,

    location: data.location,

    description: data.description,

    createdAt: new Date().toISOString(),
  };

  state.products.push(product);

  addHistory({
    type: "create",

    message: `Produto "${product.name}" foi cadastrado.`,

    productId: product.id,
  });

  saveData();

  renderAll();

  resetProductForm();

  showToast("Produto cadastrado com sucesso!");

  showSection("produtos");
}

function editExistingProduct(id, data) {
  const product = state.products.find((item) => item.id === id);

  if (!product) {
    return;
  }

  const oldQuantity = product.quantity;

  product.name = data.name;

  product.code = data.code;

  product.category = data.category;

  product.quantity = data.quantity;

  product.minimum = data.minimum;

  product.location = data.location;

  product.description = data.description;

  addHistory({
    type: "edit",

    message: `Produto "${product.name}" foi atualizado.`,

    productId: product.id,
  });

  if (oldQuantity !== product.quantity) {
    addHistory({
      type: "stock",

      message: `Estoque de "${product.name}" alterado de ${oldQuantity} para ${product.quantity}.`,

      productId: product.id,
    });
  }

  saveData();

  renderAll();

  resetProductForm();

  showToast("Produto atualizado com sucesso!");

  showSection("produtos");
}

function editProduct(id) {
  const product = state.products.find((item) => item.id === id);

  if (!product) {
    return;
  }

  document.getElementById("editing-id").value = product.id;

  document.getElementById("name").value = product.name;

  document.getElementById("code").value = product.code;

  document.getElementById("category").value = product.category;

  document.getElementById("quantity").value = product.quantity;

  document.getElementById("minimum").value = product.minimum;

  document.getElementById("location").value = product.location || "";

  document.getElementById("description").value = product.description || "";

  document.getElementById("form-title").textContent = "Editar produto";

  document.getElementById("cancel-edit").classList.remove("hidden");

  showSection("adicionar");
}

function cancelEdit() {
  resetProductForm();
}

function resetProductForm() {
  document.getElementById("product-form").reset();

  document.getElementById("editing-id").value = "";

  document.getElementById("form-title").textContent = "Adicionar produto";

  document.getElementById("cancel-edit").classList.add("hidden");
}

function removeProduct(id) {
  const product = state.products.find((item) => item.id === id);

  if (!product) {
    return;
  }

  const confirmDelete = confirm(`Deseja realmente excluir "${product.name}"?`);

  if (!confirmDelete) {
    return;
  }

  const hasLoan = state.loans.some(
    (loan) => loan.productId === id && !loan.returned,
  );

  if (hasLoan) {
    showToast("Esse produto possui empréstimos ativos.");

    return;
  }

  state.products = state.products.filter((item) => item.id !== id);

  addHistory({
    type: "delete",

    message: `Produto "${product.name}" foi removido.`,

    productId: id,
  });

  saveData();

  renderAll();

  showToast("Produto removido.");
}

/* =====================================================
   RENDERIZAÇÃO DE PRODUTOS
===================================================== */

function renderProducts() {
  const container = document.getElementById("product-list");

  const search = document
    .getElementById("search-input")
    .value.trim()
    .toLowerCase();

  const category = document.getElementById("category-filter").value;

  const status = document.getElementById("status-filter").value;

  const sort = document.getElementById("sort-filter").value;

  let products = [...state.products];

  products = products.filter((product) => {
    const matchesSearch =
      !search ||
      product.name.toLowerCase().includes(search) ||
      product.code.toLowerCase().includes(search) ||
      product.category.toLowerCase().includes(search);

    const matchesCategory = !category || product.category === category;

    const available = getAvailableQuantity(product);

    const matchesStatus =
      !status ||
      (status === "available" &&
        available > 0 &&
        product.quantity > product.minimum) ||
      (status === "low" && available > 0 && available <= product.minimum) ||
      (status === "empty" && available <= 0) ||
      (status === "borrowed" && product.quantity > available);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  sortProducts(products, sort);

  container.innerHTML = "";

  if (!products.length) {
    container.innerHTML = `

            <div class="empty">

                📦

                <br><br>

                Nenhum produto encontrado.

            </div>

        `;

    return;
  }

  products.forEach((product) => {
    container.appendChild(createProductCard(product));
  });
}

function sortProducts(products, sort) {
  if (sort === "name") {
    products.sort((a, b) => a.name.localeCompare(b.name));
  }

  if (sort === "quantity") {
    products.sort((a, b) => b.quantity - a.quantity);
  }

  if (sort === "category") {
    products.sort((a, b) => a.category.localeCompare(b.category));
  }

  if (sort === "newest") {
    products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}

function createProductCard(product) {
  const card = document.createElement("div");

  card.className = "product-card";

  const available = getAvailableQuantity(product);

  const borrowed = product.quantity - available;

  const status = getProductStatus(product);

  card.innerHTML = `

        <div class="product-header">

            <div>

                <h3>
                    ${escapeHTML(product.name)}
                </h3>

                <div class="product-code">
                    ${escapeHTML(product.code)}
                </div>

            </div>

            <span class="badge ${status.class}">
                ${status.text}
            </span>

        </div>


        <div class="product-info">

            <div class="info-row">

                <span>Categoria</span>

                <strong>
                    ${escapeHTML(product.category)}
                </strong>

            </div>


            <div class="info-row">

                <span>Disponível</span>

                <strong>
                    ${available}
                </strong>

            </div>


            <div class="info-row">

                <span>Emprestados</span>

                <strong>
                    ${borrowed}
                </strong>

            </div>


            <div class="info-row">

                <span>Estoque mínimo</span>

                <strong>
                    ${product.minimum}
                </strong>

            </div>


            <div class="info-row">

                <span>Localização</span>

                <strong>
                    ${escapeHTML(product.location || "Não informado")}
                </strong>

            </div>

        </div>


        ${
          product.description
            ? `
                    <p class="product-description">
                        ${escapeHTML(product.description)}
                    </p>
                `
            : ""
        }


        <div class="product-actions">

            <button
                class="borrow-button"
                onclick="openLoanModal('${product.id}')"
                ${available <= 0 ? "disabled" : ""}
            >
                📤 Emprestar
            </button>


            <button
                class="edit-button"
                onclick="editProduct('${product.id}')"
            >
                ✏️ Editar
            </button>


            <button
                class="delete-button"
                onclick="removeProduct('${product.id}')"
            >
                🗑️ Excluir
            </button>

        </div>

    `;

  return card;
}

/* =====================================================
   STATUS DO PRODUTO
===================================================== */

function getProductStatus(product) {
  const available = getAvailableQuantity(product);

  if (available <= 0) {
    return {
      text: "Esgotado",

      class: "badge-danger",
    };
  }

  if (available <= product.minimum) {
    return {
      text: "Estoque baixo",

      class: "badge-warning",
    };
  }

  return {
    text: "Disponível",

    class: "badge-success",
  };
}

/* =====================================================
   QUANTIDADE DISPONÍVEL
===================================================== */

function getAvailableQuantity(product) {
  const borrowed = state.loans
    .filter((loan) => loan.productId === product.id && !loan.returned)
    .reduce((total, loan) => total + loan.quantity, 0);

  return Math.max(0, product.quantity - borrowed);
}

/* =====================================================
   EMPRÉSTIMOS
===================================================== */

function openLoanModal(productId) {
  const product = state.products.find((item) => item.id === productId);

  if (!product) {
    return;
  }

  const available = getAvailableQuantity(product);

  if (available <= 0) {
    showToast("Não há unidades disponíveis.");

    return;
  }

  document.getElementById("loan-product-id").value = productId;

  document.getElementById("loan-quantity").value = 1;

  document.getElementById("loan-quantity").max = available;

  document.getElementById("borrower").value = "";

  document.getElementById("loan-reason").value = "";

  const date = new Date();

  date.setDate(date.getDate() + 7);

  document.getElementById("loan-due-date").value = formatDateForInput(date);

  document.getElementById("loan-modal").classList.remove("hidden");
}

function closeLoanModal() {
  document.getElementById("loan-modal").classList.add("hidden");
}

function handleLoanSubmit(event) {
  event.preventDefault();

  const productId = document.getElementById("loan-product-id").value;

  const borrower = document.getElementById("borrower").value.trim();

  const quantity = Number(document.getElementById("loan-quantity").value);

  const reason = document.getElementById("loan-reason").value.trim();

  const dueDate = document.getElementById("loan-due-date").value;

  const product = state.products.find((item) => item.id === productId);

  if (!product) {
    return;
  }

  const available = getAvailableQuantity(product);

  if (quantity <= 0 || quantity > available) {
    showToast("Quantidade de empréstimo inválida.");

    return;
  }

  const loan = {
    id: generateId(),

    productId,

    borrower,

    quantity,

    reason,

    dueDate,

    loanDate: new Date().toISOString(),

    returned: false,

    returnedAt: null,
  };

  state.loans.push(loan);

  addHistory({
    type: "loan",

    message: `${quantity} unidade(s) de "${product.name}" foram emprestadas para ${borrower}.`,

    productId,
  });

  saveData();

  renderAll();

  closeLoanModal();

  showToast("Empréstimo registrado!");
}

function returnLoan(loanId) {
  const loan = state.loans.find((item) => item.id === loanId);

  if (!loan || loan.returned) {
    return;
  }

  const product = state.products.find((item) => item.id === loan.productId);

  loan.returned = true;

  loan.returnedAt = new Date().toISOString();

  addHistory({
    type: "return",

    message: `${loan.quantity} unidade(s) de "${product?.name || "produto"}" foram devolvidas por ${loan.borrower}.`,

    productId: loan.productId,
  });

  saveData();

  renderAll();

  showToast("Produto devolvido com sucesso!");
}

/* =====================================================
   RENDERIZAÇÃO DOS EMPRÉSTIMOS
===================================================== */

function renderLoans() {
  const container = document.getElementById("loan-list");

  const activeLoans = state.loans.filter((loan) => !loan.returned);

  const returnedLoans = state.loans.filter((loan) => loan.returned);

  container.innerHTML = "";

  if (!state.loans.length) {
    container.innerHTML = `

            <div class="empty">

                📤

                <br><br>

                Nenhum empréstimo registrado.

            </div>

        `;

    return;
  }

  if (activeLoans.length) {
    const title = document.createElement("h3");

    title.textContent = "Empréstimos ativos";

    title.style.marginBottom = "15px";

    container.appendChild(title);

    activeLoans.forEach((loan) => {
      container.appendChild(createLoanCard(loan));
    });
  }

  if (returnedLoans.length) {
    const title = document.createElement("h3");

    title.textContent = "Empréstimos devolvidos";

    title.style.margin = "30px 0 15px";

    container.appendChild(title);

    returnedLoans
      .slice()
      .reverse()
      .forEach((loan) => {
        container.appendChild(createLoanCard(loan));
      });
  }
}

function createLoanCard(loan) {
  const product = state.products.find((item) => item.id === loan.productId);

  const card = document.createElement("div");

  const overdue = !loan.returned && isOverdue(loan.dueDate);

  const dueSoon = !loan.returned && isDueSoon(loan.dueDate);

  card.className = "loan-card";

  if (overdue) {
    card.classList.add("loan-overdue");
  } else if (dueSoon) {
    card.classList.add("loan-warning");
  }

  const status = loan.returned
    ? "Devolvido"
    : overdue
      ? "Atrasado"
      : dueSoon
        ? "Devolução próxima"
        : "No prazo";

  card.innerHTML = `

        <div class="loan-header">

            <div>

                <h3>
                    ${escapeHTML(product?.name || "Produto removido")}
                </h3>

                <p class="product-code">
                    ${escapeHTML(product?.code || "")}
                </p>

            </div>


            <span class="badge ${
              loan.returned
                ? "badge-success"
                : overdue
                  ? "badge-danger"
                  : dueSoon
                    ? "badge-warning"
                    : "badge-success"
            }">

                ${status}

            </span>

        </div>


        <div class="loan-info">

            <div class="loan-field">

                <small>Responsável</small>

                <strong>
                    ${escapeHTML(loan.borrower)}
                </strong>

            </div>


            <div class="loan-field">

                <small>Quantidade</small>

                <strong>
                    ${loan.quantity}
                </strong>

            </div>


            <div class="loan-field">

                <small>Data do empréstimo</small>

                <strong>
                    ${formatDate(loan.loanDate)}
                </strong>

            </div>


            <div class="loan-field">

                <small>Devolução prevista</small>

                <strong>
                    ${formatDate(loan.dueDate)}
                </strong>

            </div>


            <div class="loan-field">

                <small>Motivo</small>

                <strong>
                    ${escapeHTML(loan.reason || "Não informado")}
                </strong>

            </div>

        </div>


        ${
          loan.returned
            ? `
                    <p class="history-date">
                        Devolvido em
                        ${formatDate(loan.returnedAt)}
                    </p>
                `
            : `
                    <button
                        class="primary-button"
                        onclick="returnLoan('${loan.id}')"
                    >
                        📥 Registrar devolução
                    </button>
                `
        }

    `;

  return card;
}

/* =====================================================
   HISTÓRICO
===================================================== */

function addHistory(data) {
  state.history.push({
    id: generateId(),

    type: data.type,

    message: data.message,

    productId: data.productId || null,

    date: new Date().toISOString(),
  });
}

function renderHistory() {
  const container = document.getElementById("history-list");

  container.innerHTML = "";

  if (!state.history.length) {
    container.innerHTML = `

            <div class="empty">

                📜

                <br><br>

                Nenhuma movimentação registrada.

            </div>

        `;

    return;
  }

  state.history
    .slice()
    .reverse()
    .forEach((item) => {
      const element = document.createElement("div");

      element.className = "history-item";

      element.innerHTML = `

                <div class="history-icon">

                    ${getHistoryIcon(item.type)}

                </div>


                <div class="history-content">

                    <strong>
                        ${escapeHTML(item.message)}
                    </strong>

                    <span class="history-date">

                        ${formatDate(item.date)}

                    </span>

                </div>

            `;

      container.appendChild(element);
    });
}

function getHistoryIcon(type) {
  const icons = {
    create: "➕",

    edit: "✏️",

    delete: "🗑️",

    loan: "📤",

    return: "📥",

    stock: "📦",
  };

  return icons[type] || "📋";
}

/* =====================================================
   DASHBOARD
===================================================== */

function renderDashboard() {
  const cards = document.getElementById("dashboard-cards");

  const totalProducts = state.products.length;

  const totalUnits = state.products.reduce(
    (total, product) => total + product.quantity,
    0,
  );

  const lowStock = state.products.filter((product) => {
    const available = getAvailableQuantity(product);

    return available > 0 && available <= product.minimum;
  }).length;

  const emptyStock = state.products.filter(
    (product) => getAvailableQuantity(product) <= 0,
  ).length;

  const activeLoans = state.loans.filter((loan) => !loan.returned).length;

  cards.innerHTML = `

        <div class="dashboard-card">

            <div class="icon">
                📦
            </div>

            <div class="number">
                ${totalProducts}
            </div>

            <div class="label">
                Produtos cadastrados
            </div>

        </div>


        <div class="dashboard-card">

            <div class="icon">
                🔢
            </div>

            <div class="number">
                ${totalUnits}
            </div>

            <div class="label">
                Unidades no estoque
            </div>

        </div>


        <div class="dashboard-card">

            <div class="icon">
                ⚠️
            </div>

            <div class="number">
                ${lowStock}
            </div>

            <div class="label">
                Estoques baixos
            </div>

        </div>


        <div class="dashboard-card">

            <div class="icon">
                📤
            </div>

            <div class="number">
                ${activeLoans}
            </div>

            <div class="label">
                Empréstimos ativos
            </div>

        </div>

    `;

  renderCategorySummary();

  renderRecentHistory();
}

function renderCategorySummary() {
  const container = document.getElementById("category-summary");

  container.innerHTML = "";

  if (!state.categories.length) {
    container.innerHTML = `<p class="empty">
                Nenhuma categoria.
            </p>`;

    return;
  }

  const total = Math.max(1, state.products.length);

  state.categories.forEach((category) => {
    const count = state.products.filter(
      (product) => product.category === category,
    ).length;

    const percentage = Math.min(100, (count / total) * 100);

    const row = document.createElement("div");

    row.className = "category-row";

    row.innerHTML = `

            <div class="category-row-header">

                <span>
                    ${escapeHTML(category)}
                </span>

                <strong>
                    ${count}
                </strong>

            </div>


            <div class="progress">

                <div
                    class="progress-bar"
                    style="width: ${percentage}%"
                ></div>

            </div>

        `;

    container.appendChild(row);
  });
}

function renderRecentHistory() {
  const container = document.getElementById("recent-history");

  const recent = state.history.slice().reverse().slice(0, 6);

  container.innerHTML = "";

  if (!recent.length) {
    container.innerHTML = `

            <div class="empty">

                Nenhuma movimentação ainda.

            </div>

        `;

    return;
  }

  recent.forEach((item) => {
    const element = document.createElement("div");

    element.className = "history-item";

    element.innerHTML = `

            <div class="history-icon">

                ${getHistoryIcon(item.type)}

            </div>


            <div class="history-content">

                <strong>
                    ${escapeHTML(item.message)}
                </strong>

                <span class="history-date">

                    ${formatDate(item.date)}

                </span>

            </div>

        `;

    container.appendChild(element);
  });
}

/* =====================================================
   FILTROS
===================================================== */

function setupFilters() {
  ["search-input", "category-filter", "status-filter", "sort-filter"].forEach(
    (id) => {
      document.getElementById(id).addEventListener("input", renderProducts);

      document.getElementById(id).addEventListener("change", renderProducts);
    },
  );
}

/* =====================================================
   SISTEMA
===================================================== */

function setupSystemEvents() {
  document.getElementById("export-csv").addEventListener("click", exportCSV);

  document
    .getElementById("export-backup")
    .addEventListener("click", exportBackup);

  document
    .getElementById("import-backup")
    .addEventListener("change", importBackup);

  document.getElementById("clear-data").addEventListener("click", clearAllData);

  document
    .getElementById("clear-history")
    .addEventListener("click", clearHistory);
}

/* =====================================================
   EXPORTAR CSV
===================================================== */

function exportCSV() {
  if (!state.products.length) {
    showToast("Não há produtos para exportar.");

    return;
  }

  const header = [
    "Código",
    "Nome",
    "Categoria",
    "Quantidade",
    "Disponível",
    "Emprestados",
    "Estoque mínimo",
    "Localização",
    "Descrição",
  ];

  const rows = state.products.map((product) => {
    const available = getAvailableQuantity(product);

    return [
      product.code,

      product.name,

      product.category,

      product.quantity,

      available,

      product.quantity - available,

      product.minimum,

      product.location,

      product.description,
    ];
  });

  const csv = [header, ...rows]
    .map((row) =>
      row
        .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
        .join(","),
    )
    .join("\n");

  downloadFile(
    csv,

    "estoque-almoxarifado.csv",

    "text/csv;charset=utf-8;",
  );

  showToast("Estoque exportado!");
}

/* =====================================================
   BACKUP
===================================================== */

function exportBackup() {
  const backup = {
    ...state,

    exportedAt: new Date().toISOString(),

    version: "2.0",
  };

  const json = JSON.stringify(backup, null, 2);

  downloadFile(
    json,

    "backup-almoxarifado.json",

    "application/json",
  );

  showToast("Backup criado com sucesso!");
}

/* =====================================================
   IMPORTAR BACKUP
===================================================== */

function importBackup(event) {
  const file = event.target.files[0];

  if (!file) {
    return;
  }

  const reader = new FileReader();

  reader.onload = function () {
    try {
      const imported = JSON.parse(reader.result);

      if (
        !Array.isArray(imported.products) ||
        !Array.isArray(imported.categories) ||
        !Array.isArray(imported.loans)
      ) {
        throw new Error("Backup inválido");
      }

      const confirmImport = confirm(
        "Importar este backup substituirá os dados atuais. Deseja continuar?",
      );

      if (!confirmImport) {
        return;
      }

      state = {
        products: imported.products,

        categories: imported.categories,

        loans: imported.loans,

        history: imported.history || [],
      };

      saveData();

      renderAll();

      showToast("Backup restaurado!");
    } catch (error) {
      console.error(error);

      showToast("Arquivo de backup inválido.");
    }
  };

  reader.readAsText(file);

  event.target.value = "";
}

/* =====================================================
   LIMPAR DADOS
===================================================== */

function clearAllData() {
  const confirmation = confirm(
    "ATENÇÃO: isso apagará todos os produtos, empréstimos e histórico. Deseja continuar?",
  );

  if (!confirmation) {
    return;
  }

  const secondConfirmation = confirm(
    "Essa ação não pode ser desfeita. Confirma?",
  );

  if (!secondConfirmation) {
    return;
  }

  state = {
    products: [],

    categories: [...DEFAULT_CATEGORIES],

    loans: [],

    history: [],
  };

  saveData();

  renderAll();

  showToast("Todos os dados foram apagados.");
}

function clearHistory() {
  if (!state.history.length) {
    showToast("O histórico já está vazio.");

    return;
  }

  if (!confirm("Deseja realmente limpar o histórico?")) {
    return;
  }

  state.history = [];

  saveData();

  renderAll();

  showToast("Histórico limpo.");
}

/* =====================================================
   DARK MODE
===================================================== */

function setupTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);

  if (savedTheme === "dark") {
    document.body.classList.add("dark");
  }

  updateThemeButton();

  document
    .getElementById("theme-toggle")
    .addEventListener("click", toggleTheme);
}

function toggleTheme() {
  document.body.classList.toggle("dark");

  const dark = document.body.classList.contains("dark");

  localStorage.setItem(
    THEME_KEY,

    dark ? "dark" : "light",
  );

  updateThemeButton();
}

function updateThemeButton() {
  const button = document.getElementById("theme-toggle");

  const dark = document.body.classList.contains("dark");

  button.textContent = dark ? "☀️" : "🌙";
}

/* =====================================================
   RENDERIZAÇÃO GERAL
===================================================== */

function renderAll() {
  renderCategories();

  renderProducts();

  renderLoans();

  renderHistory();

  renderDashboard();
}

/* =====================================================
   UTILITÁRIOS
===================================================== */

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

function formatDate(dateString) {
  if (!dateString) {
    return "Não informado";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("pt-BR");
}

function formatDateForInput(date) {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isOverdue(dateString) {
  if (!dateString) {
    return false;
  }

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const due = new Date(`${dateString}T00:00:00`);

  return due < today;
}

function isDueSoon(dateString) {
  if (!dateString) {
    return false;
  }

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const due = new Date(`${dateString}T00:00:00`);

  const difference = due - today;

  const days = difference / (1000 * 60 * 60 * 24);

  return days >= 0 && days <= 3;
}

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], {
    type,
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;

  link.download = filename;

  document.body.appendChild(link);

  link.click();

  link.remove();

  URL.revokeObjectURL(url);
}

function showToast(message) {
  const container = document.getElementById("toast-container");

  const toast = document.createElement("div");

  toast.className = "toast";

  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}