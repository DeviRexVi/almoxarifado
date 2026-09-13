// ======================================================
// ALMOXARIFADO TECNOLÓGICO
// ======================================================

const STORAGE_KEY = "almoxarifado_tecnologico_v3";

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

// ======================================================
// ESTADO
// ======================================================

let state = loadState();

// ======================================================
// PERSISTÊNCIA
// ======================================================

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved) {
    try {
      const data = JSON.parse(saved);

      return {
        products: data.products || [],
        categories: data.categories || [...DEFAULT_CATEGORIES],
        loans: data.loans || [],
      };
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  }

  return {
    products: [],
    categories: [...DEFAULT_CATEGORIES],
    loans: [],
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ======================================================
// FUNÇÕES AUXILIARES
// ======================================================

function generateId() {
  return Date.now().toString() + Math.random().toString(36).substring(2);
}

function escapeHTML(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDate(date) {
  if (!date) {
    return "-";
  }

  return new Date(date).toLocaleDateString("pt-BR");
}

// ======================================================
// ESTOQUE
// ======================================================

function getBorrowedQuantity(productId) {
  return state.loans
    .filter((loan) => loan.productId === productId && loan.status === "active")
    .reduce((total, loan) => total + Number(loan.quantity), 0);
}

function getAvailableQuantity(productId) {
  const product = state.products.find((product) => product.id === productId);

  if (!product) {
    return 0;
  }

  return Number(product.quantity) - getBorrowedQuantity(productId);
}

// ======================================================
// CATEGORIAS
// ======================================================

function renderCategories() {
  const categorySelect = document.getElementById("category");

  const categoryFilter = document.getElementById("category-filter");

  const categoryList = document.getElementById("category-list");

  // Categorias do formulário de cadastro

  if (categorySelect) {
    categorySelect.innerHTML = `
            <option value="">
                Selecione uma categoria
            </option>

            ${state.categories
              .map(
                (category) => `
                <option value="${escapeHTML(category)}">
                    ${escapeHTML(category)}
                </option>
            `,
              )
              .join("")}
        `;
  }

  // Filtro de produtos

  if (categoryFilter) {
    const currentValue = categoryFilter.value;

    categoryFilter.innerHTML = `
            <option value="">
                Todas as categorias
            </option>

            ${state.categories
              .map(
                (category) => `
                <option value="${escapeHTML(category)}">
                    ${escapeHTML(category)}
                </option>
            `,
              )
              .join("")}

        `;

    if (state.categories.includes(currentValue)) {
      categoryFilter.value = currentValue;
    }
  }

  // Lista de categorias

  if (categoryList) {
    if (state.categories.length === 0) {
      categoryList.innerHTML = "<li>Nenhuma categoria cadastrada.</li>";

      return;
    }

    categoryList.innerHTML = state.categories
      .map((category) => {
        const hasProducts = state.products.some(
          (product) => product.category === category,
        );

        return `
                    <li>
                        <strong>
                            ${escapeHTML(category)}
                        </strong>

                        ${
                          hasProducts
                            ? "<span> - possui produtos</span>"
                            : `
                                    <button
                                        onclick="removeCategory('${escapeHTML(category)}')">
                                        Remover
                                    </button>
                                `
                        }
                    </li>
                `;
      })
      .join("");
  }
}

function addCategory(event) {
  event.preventDefault();

  const input = document.getElementById("category-name");

  if (!input) {
    return;
  }

  const category = input.value.trim();

  if (!category) {
    alert("Digite o nome da categoria.");
    return;
  }

  const exists = state.categories.some(
    (item) => item.toLowerCase() === category.toLowerCase(),
  );

  if (exists) {
    alert("Essa categoria já existe.");
    return;
  }

  state.categories.push(category);

  saveState();

  input.value = "";

  renderCategories();

  alert("Categoria adicionada com sucesso!");
}

function removeCategory(categoryName) {
  const hasProducts = state.products.some(
    (product) => product.category === categoryName,
  );

  if (hasProducts) {
    alert(
      "Não é possível remover essa categoria " +
        "porque existem produtos cadastrados nela.",
    );

    return;
  }

  const confirmed = confirm(`Deseja remover a categoria "${categoryName}"?`);

  if (!confirmed) {
    return;
  }

  state.categories = state.categories.filter(
    (category) => category !== categoryName,
  );

  saveState();

  renderCategories();
}

// ======================================================
// PRODUTOS
// ======================================================

function addProduct(event) {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();

  const code = document.getElementById("code").value.trim();

  const category = document.getElementById("category").value;

  const quantity = Number(document.getElementById("quantity").value);

  const minimum = Number(document.getElementById("minimum").value);

  const location = document.getElementById("location").value.trim();

  const description = document.getElementById("description").value.trim();

  if (!name) {
    alert("Digite o nome do componente.");
    return;
  }

  if (!code) {
    alert("Digite o código/patrimônio.");
    return;
  }

  if (!category) {
    alert("Selecione uma categoria.");
    return;
  }

  if (!Number.isInteger(quantity) || quantity < 0) {
    alert("A quantidade deve ser um número inteiro maior ou igual a zero.");

    return;
  }

  if (!Number.isInteger(minimum) || minimum < 0) {
    alert("O estoque mínimo deve ser um número inteiro maior ou igual a zero.");

    return;
  }

  // Verifica código duplicado

  const duplicate = state.products.some(
    (product) => product.code.toLowerCase() === code.toLowerCase(),
  );

  if (duplicate) {
    alert("Já existe um produto cadastrado com esse código.");

    return;
  }

  const product = {
    id: generateId(),

    name,

    code,

    category,

    quantity,

    minimum,

    location,

    description,

    createdAt: new Date().toISOString(),

    updatedAt: new Date().toISOString(),
  };

  state.products.push(product);

  saveState();

  document.getElementById("product-form").reset();

  renderAll();

  alert("Produto cadastrado com sucesso!");
}

// ======================================================
// PESQUISA
// ======================================================

function getFilteredProducts() {
  const searchInput = document.getElementById("search-input");

  const categoryFilter = document.getElementById("category-filter");

  const search = searchInput ? searchInput.value.trim().toLowerCase() : "";

  const category = categoryFilter ? categoryFilter.value : "";

  return state.products.filter((product) => {
    const matchesSearch =
      !search ||
      product.name.toLowerCase().includes(search) ||
      product.code.toLowerCase().includes(search) ||
      product.category.toLowerCase().includes(search);

    const matchesCategory = !category || product.category === category;

    return matchesSearch && matchesCategory;
  });
}

// ======================================================
// LISTAGEM DE PRODUTOS
// ======================================================

function renderProducts() {
  const container = document.getElementById("product-list");

  if (!container) {
    return;
  }

  const products = getFilteredProducts();

  if (products.length === 0) {
    container.innerHTML = `
            <p>Nenhum produto encontrado.</p>
        `;

    return;
  }

  container.innerHTML = products
    .map((product) => {
      const borrowed = getBorrowedQuantity(product.id);

      const available = getAvailableQuantity(product.id);

      let stockMessage = "";

      if (available === 0) {
        stockMessage = `<p><strong>Status:</strong> Sem estoque</p>`;
      } else if (available <= product.minimum) {
        stockMessage = `<p><strong>Status:</strong> Estoque baixo</p>`;
      }

      return `

                <div class="product-item">

                    <h3>
                        ${escapeHTML(product.name)}
                    </h3>

                    <p>
                        <strong>Código:</strong>
                        ${escapeHTML(product.code)}
                    </p>

                    <p>
                        <strong>Categoria:</strong>
                        ${escapeHTML(product.category)}
                    </p>

                    <p>
                        <strong>Quantidade total:</strong>
                        ${product.quantity}
                    </p>

                    <p>
                        <strong>Disponível:</strong>
                        ${available}
                    </p>

                    <p>
                        <strong>Emprestado:</strong>
                        ${borrowed}
                    </p>

                    <p>
                        <strong>Estoque mínimo:</strong>
                        ${product.minimum}
                    </p>

                    <p>
                        <strong>Localização:</strong>
                        ${escapeHTML(product.location || "-")}
                    </p>

                    ${
                      product.description
                        ? `
                                <p>
                                    <strong>Descrição:</strong>
                                    ${escapeHTML(product.description)}
                                </p>
                            `
                        : ""
                    }

                    ${stockMessage}


                    <div class="product-actions">

                        ${
                          available > 0
                            ? `
                                    <button
                                        onclick="borrowProduct('${product.id}')">
                                        Pegar emprestado
                                    </button>
                                `
                            : `
                                    <button disabled>
                                        Indisponível
                                    </button>
                                `
                        }


                        <button
                            onclick="editProduct('${product.id}')">
                            Editar
                        </button>


                        <button
                            onclick="removeProduct('${product.id}')">
                            Remover
                        </button>

                    </div>

                </div>
            `;
    })
    .join("");
}

// ======================================================
// EDITAR PRODUTO
// ======================================================

function editProduct(productId) {
  const product = state.products.find((item) => item.id === productId);

  if (!product) {
    alert("Produto não encontrado.");
    return;
  }

  const name = prompt("Nome do componente:", product.name);

  if (name === null) {
    return;
  }

  const code = prompt("Código / patrimônio:", product.code);

  if (code === null) {
    return;
  }

  const quantityInput = prompt("Quantidade total:", product.quantity);

  if (quantityInput === null) {
    return;
  }

  const quantity = Number(quantityInput);

  if (!Number.isInteger(quantity) || quantity < 0) {
    alert("Quantidade inválida.");

    return;
  }

  const borrowed = getBorrowedQuantity(productId);

  if (quantity < borrowed) {
    alert(
      `Não é possível colocar ${quantity} unidade(s), ` +
        `pois existem ${borrowed} unidade(s) emprestadas.`,
    );

    return;
  }

  const duplicate = state.products.some(
    (item) =>
      item.id !== productId &&
      item.code.toLowerCase() === code.trim().toLowerCase(),
  );

  if (duplicate) {
    alert("Esse código já está sendo utilizado.");

    return;
  }

  product.name = name.trim();

  product.code = code.trim();

  product.quantity = quantity;

  product.updatedAt = new Date().toISOString();

  saveState();

  renderAll();

  alert("Produto atualizado com sucesso!");
}

// ======================================================
// REMOVER PRODUTO
// ======================================================

function removeProduct(productId) {
  const product = state.products.find((item) => item.id === productId);

  if (!product) {
    alert("Produto não encontrado.");
    return;
  }

  const borrowed = getBorrowedQuantity(productId);

  if (borrowed > 0) {
    alert(
      "Não é possível remover esse produto " +
        "porque ele possui unidades emprestadas.",
    );

    return;
  }

  const confirmed = confirm(`Deseja realmente remover "${product.name}"?`);

  if (!confirmed) {
    return;
  }

  state.products = state.products.filter((item) => item.id !== productId);

  saveState();

  renderAll();

  alert("Produto removido do almoxarifado.");
}

// ======================================================
// EMPRÉSTIMO
// ======================================================

function borrowProduct(productId) {
  const product = state.products.find((item) => item.id === productId);

  if (!product) {
    alert("Produto não encontrado.");

    return;
  }

  const available = getAvailableQuantity(productId);

  if (available <= 0) {
    alert("Não existem unidades disponíveis.");

    return;
  }

  const borrower = prompt("Nome de quem está pegando o componente:");

  if (borrower === null || !borrower.trim()) {
    return;
  }

  const quantityInput = prompt(
    `Quantidade para empréstimo.\n` + `Disponível: ${available}`,
  );

  if (quantityInput === null) {
    return;
  }

  const quantity = Number(quantityInput);

  if (!Number.isInteger(quantity) || quantity <= 0) {
    alert("Informe uma quantidade válida.");

    return;
  }

  if (quantity > available) {
    alert(
      `Você tentou pegar ${quantity} unidade(s), ` +
        `mas só existem ${available} disponíveis.`,
    );

    return;
  }

  const reason = prompt("Motivo do empréstimo (opcional):");

  const now = new Date().toISOString();

  const loan = {
    id: generateId(),

    productId: product.id,

    productName: product.name,

    productCode: product.code,

    borrower: borrower.trim(),

    quantity,

    reason: reason ? reason.trim() : "",

    loanDate: now,

    status: "active",

    returnedAt: null,
  };

  state.loans.push(loan);

  saveState();

  renderAll();

  alert("Empréstimo registrado com sucesso!");
}

// ======================================================
// DEVOLUÇÃO
// ======================================================

function returnLoan(loanId) {
  const loan = state.loans.find((item) => item.id === loanId);

  if (!loan) {
    alert("Empréstimo não encontrado.");

    return;
  }

  if (loan.status !== "active") {
    alert("Esse item já foi devolvido.");

    return;
  }

  const confirmed = confirm(
    `Confirmar devolução de ${loan.quantity} ` +
      `unidade(s) de "${loan.productName}"?`,
  );

  if (!confirmed) {
    return;
  }

  loan.status = "returned";

  loan.returnedAt = new Date().toISOString();

  saveState();

  renderAll();

  alert("Devolução registrada com sucesso!");
}

// ======================================================
// LISTA DE EMPRÉSTIMOS
// ======================================================

function renderLoans() {
  const container = document.getElementById("loan-list");

  if (!container) {
    return;
  }

  if (state.loans.length === 0) {
    container.innerHTML = `
            <p>
                Nenhum empréstimo registrado.
            </p>
        `;

    return;
  }

  const loans = [...state.loans].sort((a, b) => {
    if (a.status === "active" && b.status !== "active") {
      return -1;
    }

    if (a.status !== "active" && b.status === "active") {
      return 1;
    }

    return new Date(b.loanDate) - new Date(a.loanDate);
  });

  container.innerHTML = loans
    .map((loan) => {
      const active = loan.status === "active";

      return `

                <div class="loan-item">

                    <h3>
                        ${escapeHTML(loan.productName)}
                    </h3>

                    <p>
                        <strong>Código:</strong>
                        ${escapeHTML(loan.productCode)}
                    </p>

                    <p>
                        <strong>Responsável:</strong>
                        ${escapeHTML(loan.borrower)}
                    </p>

                    <p>
                        <strong>Quantidade:</strong>
                        ${loan.quantity}
                    </p>

                    <p>
                        <strong>Data:</strong>
                        ${formatDate(loan.loanDate)}
                    </p>

                    ${
                      loan.reason
                        ? `
                                <p>
                                    <strong>Motivo:</strong>
                                    ${escapeHTML(loan.reason)}
                                </p>
                            `
                        : ""
                    }


                    <p>
                        <strong>Status:</strong>
                        ${active ? "EMPRESTADO" : "DEVOLVIDO"}
                    </p>


                    ${
                      active
                        ? `
                                <button
                                    onclick="returnLoan('${loan.id}')">
                                    Devolver
                                </button>
                            `
                        : `
                                <p>
                                    <strong>
                                        Devolvido em:
                                    </strong>
                                    ${formatDate(loan.returnedAt)}
                                </p>
                            `
                    }

                </div>

            `;
    })
    .join("");
}

// ======================================================
// DASHBOARD
// ======================================================

function renderDashboard() {
  const cards = document.getElementById("dashboard-cards");

  const categorySummary = document.getElementById("category-summary");

  if (!cards) {
    return;
  }

  const totalProducts = state.products.length;

  const totalItems = state.products.reduce(
    (total, product) => total + Number(product.quantity),
    0,
  );

  const borrowedItems = state.products.reduce(
    (total, product) => total + getBorrowedQuantity(product.id),
    0,
  );

  const availableItems = totalItems - borrowedItems;

  const activeLoans = state.loans.filter(
    (loan) => loan.status === "active",
  ).length;

  const lowStock = state.products.filter((product) => {
    const available = getAvailableQuantity(product.id);

    return available > 0 && available <= product.minimum;
  }).length;

  const noStock = state.products.filter(
    (product) => getAvailableQuantity(product.id) <= 0,
  ).length;

  cards.innerHTML = `

        <div class="card">

            <strong>
                Produtos cadastrados
            </strong>

            <br>

            ${totalProducts}

        </div>


        <div class="card">

            <strong>
                Itens totais
            </strong>

            <br>

            ${totalItems}

        </div>


        <div class="card">

            <strong>
                Disponíveis
            </strong>

            <br>

            ${availableItems}

        </div>


        <div class="card">

            <strong>
                Emprestados
            </strong>

            <br>

            ${borrowedItems}

        </div>


        <div class="card">

            <strong>
                Empréstimos ativos
            </strong>

            <br>

            ${activeLoans}

        </div>


        <div class="card">

            <strong>
                Estoque baixo
            </strong>

            <br>

            ${lowStock}

        </div>


        <div class="card">

            <strong>
                Sem estoque
            </strong>

            <br>

            ${noStock}

        </div>


        <div class="card">

            <strong>
                Categorias
            </strong>

            <br>

            ${state.categories.length}

        </div>

    `;

  // Resumo por categoria

  if (!categorySummary) {
    return;
  }

  const summary = state.categories
    .map((category) => {
      const products = state.products.filter(
        (product) => product.category === category,
      );

      const total = products.reduce(
        (sum, product) => sum + Number(product.quantity),
        0,
      );

      const borrowed = products.reduce(
        (sum, product) => sum + getBorrowedQuantity(product.id),
        0,
      );

      return {
        category,

        total,

        borrowed,

        available: total - borrowed,
      };
    })
    .filter((item) => item.total > 0);

  if (summary.length === 0) {
    categorySummary.innerHTML = `
            <p>
                Nenhum produto cadastrado.
            </p>
        `;

    return;
  }

  categorySummary.innerHTML = summary
    .map(
      (item) => `

            <div class="card">

                <h4>
                    ${escapeHTML(item.category)}
                </h4>

                <p>
                    Total:
                    ${item.total}
                </p>

                <p>
                    Disponível:
                    ${item.available}
                </p>

                <p>
                    Emprestado:
                    ${item.borrowed}
                </p>

            </div>

        `,
    )
    .join("");
}

// ======================================================
// NAVEGAÇÃO
// ======================================================

function setupNavigation() {
  const buttons = document.querySelectorAll("[data-section]");

  const sections = document.querySelectorAll(".section");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.section;

      sections.forEach((section) => {
        section.classList.remove("active");

        section.style.display = "none";
      });

      const selected = document.getElementById(target);

      if (selected) {
        selected.classList.add("active");

        selected.style.display = "block";
      }

      buttons.forEach((item) => {
        item.classList.remove("active");
      });

      button.classList.add("active");
    });
  });
}

// ======================================================
// EVENTOS
// ======================================================

function setupEvents() {
  // Cadastro de produto

  const productForm = document.getElementById("product-form");

  if (productForm) {
    productForm.addEventListener("submit", addProduct);
  }

  // Cadastro de categoria

  const categoryForm = document.getElementById("category-form");

  if (categoryForm) {
    categoryForm.addEventListener("submit", addCategory);
  }

  // Pesquisa

  const searchInput = document.getElementById("search-input");

  if (searchInput) {
    searchInput.addEventListener("input", renderProducts);
  }

  // Filtro

  const categoryFilter = document.getElementById("category-filter");

  if (categoryFilter) {
    categoryFilter.addEventListener("change", renderProducts);
  }
}

// ======================================================
// RENDERIZA TUDO
// ======================================================

function renderAll() {
  renderCategories();

  renderProducts();

  renderLoans();

  renderDashboard();
}

// ======================================================
// INICIALIZAÇÃO
// ======================================================

document.addEventListener("DOMContentLoaded", () => {
  setupEvents();

  setupNavigation();

  renderAll();

  console.log("Foda-se, ainda não sei kkkkkk,");
});
