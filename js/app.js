/* =========================================================
   ALMOXARIFADO TECNOLÓGICO
   Sistema de controle de estoque
========================================================= */


/* =========================================================
   CONFIGURAÇÕES
========================================================= */

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
    "Outros"

];


let state = {

    products: [],

    categories: [
        ...DEFAULT_CATEGORIES
    ],

    loans: [],

    history: []

};


/* =========================================================
   UTILIDADES
========================================================= */

function generateId() {

    return Date.now().toString() +
        Math.random()
            .toString(36)
            .substring(2, 9);

}


function saveState() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(state)
    );

}


function loadState() {

    const saved =
        localStorage.getItem(STORAGE_KEY);

    if (!saved) {

        saveState();

        return;
    }


    try {

        const parsed =
            JSON.parse(saved);


        state = {

            products:
                Array.isArray(parsed.products)
                    ? parsed.products
                    : [],

            categories:
                Array.isArray(parsed.categories)
                    ? parsed.categories
                    : [...DEFAULT_CATEGORIES],

            loans:
                Array.isArray(parsed.loans)
                    ? parsed.loans
                    : [],

            history:
                Array.isArray(parsed.history)
                    ? parsed.history
                    : []

        };

    } catch (error) {

        console.error(
            "Erro ao carregar dados:",
            error
        );

        saveState();

    }

}


/* =========================================================
   TOAST
========================================================= */

function showToast(message) {

    const container =
        document.getElementById(
            "toast-container"
        );


    const toast =
        document.createElement("div");

    toast.className = "toast";

    toast.textContent = message;


    container.appendChild(toast);


    setTimeout(() => {

        toast.remove();

    }, 3000);

}


/* =========================================================
   NAVEGAÇÃO
========================================================= */

function setupNavigation() {

    const buttons =
        document.querySelectorAll(
            "[data-section]"
        );


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const target =
                    button.dataset.section;


                document
                    .querySelectorAll(".section")
                    .forEach(section => {

                        section.classList.remove(
                            "active"
                        );

                    });


                const targetSection =
                    document.getElementById(
                        target
                    );


                if (targetSection) {

                    targetSection.classList.add(
                        "active"
                    );

                }


                buttons.forEach(btn => {

                    btn.classList.remove(
                        "active"
                    );

                });


                button.classList.add(
                    "active"
                );

            }
        );

    });


    const firstButton =
        document.querySelector(
            "[data-section='dashboard']"
        );


    if (firstButton) {

        firstButton.classList.add(
            "active"
        );

    }

}


/* =========================================================
   CATEGORIAS
========================================================= */

function renderCategories() {

    const categorySelect =
        document.getElementById(
            "category"
        );


    const categoryFilter =
        document.getElementById(
            "category-filter"
        );


    const categoryList =
        document.getElementById(
            "category-list"
        );


    if (categorySelect) {

        categorySelect.innerHTML = "";

        state.categories.forEach(category => {

            const option =
                document.createElement("option");

            option.value = category;

            option.textContent = category;

            categorySelect.appendChild(
                option
            );

        });

    }


    if (categoryFilter) {

        const currentValue =
            categoryFilter.value;


        categoryFilter.innerHTML =
            `<option value="">
                Todas as categorias
            </option>`;


        state.categories.forEach(category => {

            const option =
                document.createElement("option");

            option.value = category;

            option.textContent = category;

            categoryFilter.appendChild(
                option
            );

        });


        categoryFilter.value =
            currentValue;

    }


    if (categoryList) {

        categoryList.innerHTML = "";


        if (state.categories.length === 0) {

            categoryList.innerHTML =
                `<li class="empty-state">
                    Nenhuma categoria cadastrada.
                </li>`;

            return;

        }


        state.categories.forEach(category => {

            const li =
                document.createElement("li");

            li.className =
                "category-list-item";


            const name =
                document.createElement("span");

            name.textContent =
                category;


            const button =
                document.createElement("button");

            button.className =
                "danger-button";

            button.textContent =
                "Excluir";


            button.addEventListener(
                "click",
                () => {

                    deleteCategory(category);

                }
            );


            li.appendChild(name);

            li.appendChild(button);

            categoryList.appendChild(li);

        });

    }

}


/* =========================================================
   ADICIONAR CATEGORIA
========================================================= */

function setupCategoryForm() {

    const form =
        document.getElementById(
            "category-form"
        );


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const input =
                document.getElementById(
                    "category-name"
                );


            const name =
                input.value.trim();


            if (!name) {

                return;

            }


            const exists =
                state.categories.some(
                    category =>
                        category.toLowerCase() ===
                        name.toLowerCase()
                );


            if (exists) {

                showToast(
                    "Essa categoria já existe."
                );

                return;

            }


            state.categories.push(name);

            saveState();

            input.value = "";

            renderAll();

            showToast(
                "Categoria adicionada."
            );

        }
    );

}


function deleteCategory(category) {

    const used =
        state.products.some(
            product =>
                product.category === category
        );


    if (used) {

        showToast(
            "Não é possível excluir uma categoria que possui produtos."
        );

        return;

    }


    const confirmed =
        confirm(
            `Deseja excluir a categoria "${category}"?`
        );


    if (!confirmed) {

        return;

    }


    state.categories =
        state.categories.filter(
            item => item !== category
        );


    saveState();

    renderAll();

    showToast(
        "Categoria excluída."
    );

}


/* =========================================================
   HISTÓRICO
========================================================= */

function addHistory(
    type,
    message
) {

    state.history.unshift({

        id: generateId(),

        type,

        message,

        date:
            new Date().toISOString()

    });


    /*
       Mantém somente as 200
       movimentações mais recentes.
    */

    state.history =
        state.history.slice(0, 200);

}


/* =========================================================
   PRODUTOS
========================================================= */

function setupProductForm() {

    const form =
        document.getElementById(
            "product-form"
        );


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const editingId =
                document.getElementById(
                    "editing-id"
                ).value;


            const name =
                document.getElementById(
                    "name"
                ).value.trim();


            const code =
                document.getElementById(
                    "code"
                ).value.trim();


            const category =
                document.getElementById(
                    "category"
                ).value;


            const quantity =
                Number(
                    document.getElementById(
                        "quantity"
                    ).value
                );


            const minimum =
                Number(
                    document.getElementById(
                        "minimum"
                    ).value
                );


            const location =
                document.getElementById(
                    "location"
                ).value.trim();


            const description =
                document.getElementById(
                    "description"
                ).value.trim();


            if (
                !name ||
                !code ||
                !category ||
                quantity < 0 ||
                minimum < 0
            ) {

                showToast(
                    "Preencha os campos corretamente."
                );

                return;

            }


            const duplicatedCode =
                state.products.some(
                    product =>
                        product.code.toLowerCase() ===
                        code.toLowerCase() &&
                        product.id !== editingId
                );


            if (duplicatedCode) {

                showToast(
                    "Já existe um produto com esse código."
                );

                return;

            }


            if (editingId) {

                editProduct(
                    editingId,
                    {
                        name,
                        code,
                        category,
                        quantity,
                        minimum,
                        location,
                        description
                    }
                );

            } else {

                const product = {

                    id: generateId(),

                    name,

                    code,

                    category,

                    quantity,

                    minimum,

                    location,

                    description,

                    createdAt:
                        new Date().toISOString()

                };


                state.products.push(
                    product
                );


                addHistory(
                    "create",
                    `Produto "${name}" foi cadastrado.`
                );

            }


            saveState();

            resetProductForm();

            renderAll();

            showToast(
                editingId
                    ? "Produto atualizado."
                    : "Produto cadastrado."
            );

        }
    );


    document
        .getElementById("cancel-edit")
        .addEventListener(
            "click",
            resetProductForm
        );

}


function editProduct(
    id,
    data
) {

    const product =
        state.products.find(
            item => item.id === id
        );


    if (!product) {

        return;

    }


    const oldQuantity =
        product.quantity;


    Object.assign(
        product,
        data
    );


    addHistory(
        "edit",
        `Produto "${product.name}" foi atualizado.`
    );


    if (
        oldQuantity !==
        product.quantity
    ) {

        addHistory(
            "stock",
            `Estoque de "${product.name}" alterado de ${oldQuantity} para ${product.quantity}.`
        );

    }

}


function startEditProduct(id) {

    const product =
        state.products.find(
            item => item.id === id
        );


    if (!product) {

        return;

    }


    document.getElementById(
        "editing-id"
    ).value = product.id;


    document.getElementById(
        "name"
    ).value = product.name;


    document.getElementById(
        "code"
    ).value = product.code;


    document.getElementById(
        "category"
    ).value = product.category;


    document.getElementById(
        "quantity"
    ).value = product.quantity;


    document.getElementById(
        "minimum"
    ).value = product.minimum;


    document.getElementById(
        "location"
    ).value = product.location || "";


    document.getElementById(
        "description"
    ).value =
        product.description || "";


    document.getElementById(
        "form-title"
    ).textContent =
        "Editar produto";


    document.getElementById(
        "cancel-edit"
    ).classList.remove(
        "hidden"
    );


    document
        .querySelector(
            "[data-section='adicionar']"
        )
        .click();

}


function resetProductForm() {

    const form =
        document.getElementById(
            "product-form"
        );


    form.reset();


    document.getElementById(
        "editing-id"
    ).value = "";


    document.getElementById(
        "form-title"
    ).textContent =
        "Adicionar produto";


    document.getElementById(
        "cancel-edit"
    ).classList.add(
        "hidden"
    );

}


function deleteProduct(id) {

    const product =
        state.products.find(
            item => item.id === id
        );


    if (!product) {

        return;

    }


    const activeLoan =
        state.loans.some(
            loan =>
                loan.productId === id &&
                loan.status === "active"
        );


    if (activeLoan) {

        showToast(
            "Não é possível excluir um produto com empréstimo ativo."
        );

        return;

    }


    const confirmed =
        confirm(
            `Deseja excluir "${product.name}"?`
        );


    if (!confirmed) {

        return;

    }


    state.products =
        state.products.filter(
            item => item.id !== id
        );


    addHistory(
        "delete",
        `Produto "${product.name}" foi removido do estoque.`
    );


    saveState();

    renderAll();

    showToast(
        "Produto removido."
    );

}


/* =========================================================
   STATUS DO PRODUTO
========================================================= */

function getProductStatus(product) {

    const borrowed =
        getBorrowedQuantity(
            product.id
        );


    if (product.quantity <= 0) {

        return {
            label: "Sem estoque",
            className: "status-empty"
        };

    }


    if (borrowed > 0) {

        return {
            label: "Emprestado",
            className: "status-borrowed"
        };

    }


    if (
        product.quantity <=
        product.minimum
    ) {

        return {
            label: "Estoque baixo",
            className: "status-low"
        };

    }


    return {

        label: "Disponível",

        className:
            "status-available"

    };

}


function getBorrowedQuantity(
    productId
) {

    return state.loans
        .filter(
            loan =>
                loan.productId === productId &&
                loan.status === "active"
        )
        .reduce(
            (
                total,
                loan
            ) =>
                total +
                Number(loan.quantity),
            0
        );

}


/* =========================================================
   RENDER PRODUTOS
========================================================= */

function renderProducts() {

    const container =
        document.getElementById(
            "product-list"
        );


    const search =
        document.getElementById(
            "search-input"
        ).value
            .toLowerCase()
            .trim();


    const category =
        document.getElementById(
            "category-filter"
        ).value;


    const status =
        document.getElementById(
            "status-filter"
        ).value;


    const sort =
        document.getElementById(
            "sort-filter"
        ).value;


    let products =
        [...state.products];


    products =
        products.filter(product => {

            const matchesSearch =
                !search ||
                product.name
                    .toLowerCase()
                    .includes(search) ||
                product.code
                    .toLowerCase()
                    .includes(search) ||
                product.category
                    .toLowerCase()
                    .includes(search);


            const matchesCategory =
                !category ||
                product.category === category;


            const productStatus =
                getProductStatus(product);


            let matchesStatus = true;


            if (status === "available") {

                matchesStatus =
                    productStatus.className ===
                    "status-available";

            }


            if (status === "low") {

                matchesStatus =
                    productStatus.className ===
                    "status-low";

            }


            if (status === "empty") {

                matchesStatus =
                    productStatus.className ===
                    "status-empty";

            }


            if (status === "borrowed") {

                matchesStatus =
                    getBorrowedQuantity(
                        product.id
                    ) > 0;

            }


            return (
                matchesSearch &&
                matchesCategory &&
                matchesStatus
            );

        });


    /* Ordenação */

    if (sort === "name") {

        products.sort(
            (a, b) =>
                a.name.localeCompare(
                    b.name
                )
        );

    }


    if (sort === "quantity") {

        products.sort(
            (a, b) =>
                b.quantity -
                a.quantity
        );

    }


    if (sort === "category") {

        products.sort(
            (a, b) =>
                a.category.localeCompare(
                    b.category
                )
        );

    }


    if (sort === "newest") {

        products.sort(
            (a, b) =>
                new Date(b.createdAt) -
                new Date(a.createdAt)
        );

    }


    container.innerHTML = "";


    if (products.length === 0) {

        container.innerHTML =
            `<div class="empty-state">
                Nenhum produto encontrado.
            </div>`;

        return;

    }


    products.forEach(product => {

        const borrowed =
            getBorrowedQuantity(
                product.id
            );


        const status =
            getProductStatus(product);


        const card =
            document.createElement("div");

        card.className =
            "product-card";


        card.innerHTML = `

            <div>

                <h3>
                    ${escapeHTML(product.name)}
                </h3>

                <div class="product-code">
                    Código:
                    ${escapeHTML(product.code)}
                </div>

            </div>


            <span
                class="product-status ${status.className}"
            >
                ${status.label}
            </span>


            <div class="product-info">

                <div>
                    <strong>Categoria</strong><br>
                    ${escapeHTML(product.category)}
                </div>

                <div>
                    <strong>Quantidade</strong><br>
                    ${product.quantity}
                </div>

                <div>
                    <strong>Emprestados</strong><br>
                    ${borrowed}
                </div>

                <div>
                    <strong>Localização</strong><br>
                    ${escapeHTML(
                        product.location || "Não informado"
                    )}
                </div>

            </div>


            ${
                product.description
                    ? `
                    <div class="product-description">
                        ${escapeHTML(
                            product.description
                        )}
                    </div>
                    `
                    : ""
            }


            <div class="product-actions">

                <button
                    class="primary-button"
                    data-action="borrow"
                    data-id="${product.id}"
                >
                    Emprestar
                </button>


                <button
                    class="secondary-button"
                    data-action="edit"
                    data-id="${product.id}"
                >
                    Editar
                </button>


                <button
                    class="danger-button"
                    data-action="delete"
                    data-id="${product.id}"
                >
                    Excluir
                </button>

            </div>

        `;


        card
            .querySelector(
                "[data-action='borrow']"
            )
            .addEventListener(
                "click",
                () =>
                    openLoanModal(
                        product.id
                    )
            );


        card
            .querySelector(
                "[data-action='edit']"
            )
            .addEventListener(
                "click",
                () =>
                    startEditProduct(
                        product.id
                    )
            );


        card
            .querySelector(
                "[data-action='delete']"
            )
            .addEventListener(
                "click",
                () =>
                    deleteProduct(
                        product.id
                    )
            );


        container.appendChild(card);

    });

}


/* =========================================================
   EMPRÉSTIMOS
========================================================= */

function openLoanModal(productId) {

    const product =
        state.products.find(
            item => item.id === productId
        );


    if (!product) {

        return;

    }


    const available =
        product.quantity;


    if (available <= 0) {

        showToast(
            "Esse produto está sem estoque."
        );

        return;

    }


    document.getElementById(
        "loan-product-id"
    ).value = productId;


    document.getElementById(
        "loan-quantity"
    ).value = 1;


    document.getElementById(
        "loan-quantity"
    ).max = available;


    document.getElementById(
        "borrower"
    ).value = "";


    document.getElementById(
        "loan-reason"
    ).value = "";


    document.getElementById(
        "loan-due-date"
    ).value = "";


    document
        .getElementById("loan-modal")
        .classList.remove("hidden");

}


function closeLoanModal() {

    document
        .getElementById("loan-modal")
        .classList.add("hidden");

}


function setupLoanForm() {

    document
        .getElementById("loan-form")
        .addEventListener(
            "submit",
            event => {

                event.preventDefault();


                const productId =
                    document.getElementById(
                        "loan-product-id"
                    ).value;


                const borrower =
                    document.getElementById(
                        "borrower"
                    ).value.trim();


                const quantity =
                    Number(
                        document.getElementById(
                            "loan-quantity"
                        ).value
                    );


                const reason =
                    document.getElementById(
                        "loan-reason"
                    ).value.trim();


                const dueDate =
                    document.getElementById(
                        "loan-due-date"
                    ).value;


                const product =
                    state.products.find(
                        item =>
                            item.id === productId
                    );


                if (!product) {

                    return;

                }


                if (
                    quantity <= 0 ||
                    quantity > product.quantity
                ) {

                    showToast(
                        "Quantidade inválida."
                    );

                    return;

                }


                const loan = {

                    id: generateId(),

                    productId,

                    productName:
                        product.name,

                    borrower,

                    quantity,

                    reason,

                    dueDate,

                    status: "active",

                    createdAt:
                        new Date().toISOString()

                };


                product.quantity -= quantity;


                state.loans.push(
                    loan
                );


                addHistory(
                    "loan",
                    `${quantity} unidade(s) de "${product.name}" foram emprestadas para ${borrower}.`
                );


                saveState();

                closeLoanModal();

                renderAll();

                showToast(
                    "Empréstimo registrado."
                );

            }
        );


    document
        .getElementById("close-modal")
        .addEventListener(
            "click",
            closeLoanModal
        );


    document
        .getElementById("cancel-loan")
        .addEventListener(
            "click",
            closeLoanModal
        );


    document
        .getElementById("loan-modal")
        .addEventListener(
            "click",
            event => {

                if (
                    event.target.id ===
                    "loan-modal"
                ) {

                    closeLoanModal();

                }

            }
        );

}


function returnLoan(loanId) {

    const loan =
        state.loans.find(
            item =>
                item.id === loanId
        );


    if (
        !loan ||
        loan.status !== "active"
    ) {

        return;

    }


    const product =
        state.products.find(
            item =>
                item.id === loan.productId
        );


    if (product) {

        product.quantity +=
            Number(loan.quantity);

    }


    loan.status =
        "returned";


    loan.returnedAt =
        new Date().toISOString();


    addHistory(
        "return",
        `${loan.quantity} unidade(s) de "${loan.productName}" foram devolvidas por ${loan.borrower}.`
    );


    saveState();

    renderAll();

    showToast(
        "Devolução registrada."
    );

}


/* =========================================================
   STATUS DO EMPRÉSTIMO
========================================================= */

function getLoanStatus(loan) {

    if (loan.status === "returned") {

        return {

            label: "Devolvido",

            className:
                "status-available"

        };

    }


    if (!loan.dueDate) {

        return {

            label: "Sem prazo",

            className:
                "status-borrowed"

        };

    }


    const today =
        new Date();


    today.setHours(
        0, 0, 0, 0
    );


    const due =
        new Date(
            `${loan.dueDate}T00:00:00`
        );


    const diff =
        Math.ceil(
            (
                due - today
            ) /
            (1000 * 60 * 60 * 24)
        );


    if (diff < 0) {

        return {

            label: "Atrasado",

            className:
                "status-empty"

        };

    }


    if (diff <= 2) {

        return {

            label: "Devolução próxima",

            className:
                "status-low"

        };

    }


    return {

        label: "No prazo",

        className:
            "status-available"

    };

}


/* =========================================================
   RENDER EMPRÉSTIMOS
========================================================= */

function renderLoans() {

    const container =
        document.getElementById(
            "loan-list"
        );


    container.innerHTML = "";


    const loans =
        [...state.loans]
            .sort(
                (a, b) =>
                    new Date(b.createdAt) -
                    new Date(a.createdAt)
            );


    if (loans.length === 0) {

        container.innerHTML =
            `<div class="empty-state">
                Nenhum empréstimo registrado.
            </div>`;

        return;

    }


    loans.forEach(loan => {

        const status =
            getLoanStatus(loan);


        const card =
            document.createElement("div");

        card.className =
            "loan-card";


        const dueText =
            loan.dueDate
                ? formatDate(loan.dueDate)
                : "Sem prazo definido";


        card.innerHTML = `

            <div class="loan-card-header">

                <div>

                    <h3>
                        ${escapeHTML(
                            loan.productName
                        )}
                    </h3>

                    <div class="loan-info">

                        Responsável:
                        <strong>
                            ${escapeHTML(
                                loan.borrower
                            )}
                        </strong>

                        <br>

                        Quantidade:
                        ${loan.quantity}

                        <br>

                        Motivo:
                        ${escapeHTML(
                            loan.reason ||
                            "Não informado"
                        )}

                        <br>

                        Devolução:
                        ${dueText}

                    </div>

                </div>


                <span
                    class="loan-status ${status.className}"
                >
                    ${status.label}
                </span>

            </div>


            ${
                loan.status === "active"
                    ? `
                    <div
                        class="form-actions"
                        style="margin-top: 15px;"
                    >

                        <button
                            class="primary-button"
                            data-return="${loan.id}"
                        >
                            Registrar devolução
                        </button>

                    </div>
                    `
                    : `
                    <p class="section-description">
                        Devolvido em
                        ${formatDateTime(
                            loan.returnedAt
                        )}
                    </p>
                    `
            }

        `;


        const returnButton =
            card.querySelector(
                "[data-return]"
            );


        if (returnButton) {

            returnButton.addEventListener(
                "click",
                () =>
                    returnLoan(
                        loan.id
                    )
            );

        }


        container.appendChild(card);

    });

}


/* =========================================================
   DASHBOARD
========================================================= */

function renderDashboard() {

    const cards =
        document.getElementById(
            "dashboard-cards"
        );


    const totalProducts =
        state.products.length;


    const totalUnits =
        state.products.reduce(
            (
                total,
                product
            ) =>
                total +
                Number(product.quantity),
            0
        );


    const lowStock =
        state.products.filter(
            product =>
                product.quantity <=
                product.minimum
        ).length;


    const borrowedUnits =
        state.loans
            .filter(
                loan =>
                    loan.status === "active"
            )
            .reduce(
                (
                    total,
                    loan
                ) =>
                    total +
                    Number(loan.quantity),
                0
            );


    cards.innerHTML = `

        <div class="dashboard-card">

            <h3>
                Produtos cadastrados
            </h3>

            <strong>
                ${totalProducts}
            </strong>

        </div>


        <div class="dashboard-card">

            <h3>
                Unidades em estoque
            </h3>

            <strong>
                ${totalUnits}
            </strong>

        </div>


        <div class="dashboard-card">

            <h3>
                Estoque baixo
            </h3>

            <strong>
                ${lowStock}
            </strong>

        </div>


        <div class="dashboard-card">

            <h3>
                Unidades emprestadas
            </h3>

            <strong>
                ${borrowedUnits}
            </strong>

        </div>

    `;


    renderCategorySummary();

    renderRecentHistory();

}


function renderCategorySummary() {

    const container =
        document.getElementById(
            "category-summary"
        );


    container.innerHTML = "";


    if (
        state.categories.length === 0
    ) {

        container.innerHTML =
            `<div class="empty-state">
                Nenhuma categoria cadastrada.
            </div>`;

        return;

    }


    const quantities =
        state.categories.map(
            category => {

                const quantity =
                    state.products
                        .filter(
                            product =>
                                product.category ===
                                category
                        )
                        .reduce(
                            (
                                total,
                                product
                            ) =>
                                total +
                                Number(product.quantity),
                            0
                        );


                return {
                    category,
                    quantity
                };

            }
        );


    const max =
        Math.max(
            ...quantities.map(
                item =>
                    item.quantity
            ),
            1
        );


    quantities.forEach(item => {

        const div =
            document.createElement("div");

        div.className =
            "category-item";


        const percentage =
            (
                item.quantity /
                max
            ) *
            100;


        div.innerHTML = `

            <div class="category-item-header">

                <strong>
                    ${escapeHTML(
                        item.category
                    )}
                </strong>

                <span>
                    ${item.quantity} unidade(s)
                </span>

            </div>


            <div class="progress">

                <div
                    class="progress-bar"
                    style="width: ${percentage}%"
                ></div>

            </div>

        `;


        container.appendChild(div);

    });

}


/* =========================================================
   HISTÓRICO RECENTE
========================================================= */

function renderRecentHistory() {

    const container =
        document.getElementById(
            "recent-history"
        );


    container.innerHTML = "";


    const recent =
        state.history.slice(0, 5);


    if (recent.length === 0) {

        container.innerHTML =
            `<div class="empty-state">
                Nenhuma movimentação registrada.
            </div>`;

        return;

    }


    recent.forEach(item => {

        const div =
            document.createElement("div");

        div.className =
            "history-item";


        div.innerHTML = `

            <div class="history-content">

                <strong>
                    ${escapeHTML(
                        item.message
                    )}
                </strong>

                <span>
                    ${getHistoryType(
                        item.type
                    )}
                </span>

            </div>


            <div class="history-date">

                ${formatDateTime(
                    item.date
                )}

            </div>

        `;


        container.appendChild(div);

    });

}


/* =========================================================
   HISTÓRICO COMPLETO
========================================================= */

function renderHistory() {

    const container =
        document.getElementById(
            "history-list"
        );


    container.innerHTML = "";


    if (state.history.length === 0) {

        container.innerHTML =
            `<div class="empty-state">
                Nenhuma movimentação registrada.
            </div>`;

        return;

    }


    state.history.forEach(item => {

        const div =
            document.createElement("div");

        div.className =
            "history-item";


        div.innerHTML = `

            <div class="history-content">

                <strong>
                    ${escapeHTML(
                        item.message
                    )}
                </strong>

                <span>
                    ${getHistoryType(
                        item.type
                    )}
                </span>

            </div>


            <div class="history-date">

                ${formatDateTime(
                    item.date
                )}

            </div>

        `;


        container.appendChild(div);

    });

}


function getHistoryType(type) {

    const types = {

        create: "Cadastro",

        edit: "Edição",

        delete: "Remoção",

        loan: "Empréstimo",

        return: "Devolução",

        stock: "Estoque"

    };


    return types[type] || "Movimentação";

}


/* =========================================================
   FILTROS
========================================================= */

function setupFilters() {

    document
        .getElementById("search-input")
        .addEventListener(
            "input",
            renderProducts
        );


    document
        .getElementById("category-filter")
        .addEventListener(
            "change",
            renderProducts
        );


    document
        .getElementById("status-filter")
        .addEventListener(
            "change",
            renderProducts
        );


    document
        .getElementById("sort-filter")
        .addEventListener(
            "change",
            renderProducts
        );

}


/* =========================================================
   EXPORTAR CSV
========================================================= */

function exportCSV() {

    if (state.products.length === 0) {

        showToast(
            "Não há produtos para exportar."
        );

        return;

    }


    const header = [

        "Nome",
        "Código",
        "Categoria",
        "Quantidade",
        "Estoque mínimo",
        "Localização",
        "Descrição"

    ];


    const rows =
        state.products.map(
            product => [

                product.name,

                product.code,

                product.category,

                product.quantity,

                product.minimum,

                product.location || "",

                product.description || ""

            ]
        );


    const csv = [

        header,

        ...rows

    ]

        .map(
            row =>
                row
                    .map(
                        value =>
                            `"${String(value)
                                .replace(
                                    /"/g,
                                    '""'
                                )}"`
                    )
                    .join(";")
        )

        .join("\n");


    const blob =
        new Blob(
            [
                "\uFEFF" + csv
            ],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    downloadFile(
        blob,
        "estoque-almoxarifado.csv"
    );


    showToast(
        "CSV exportado."
    );

}


/* =========================================================
   BACKUP
========================================================= */

function exportBackup() {

    const backup = {

        version: 4,

        exportedAt:
            new Date().toISOString(),

        data: state

    };


    const blob =
        new Blob(
            [
                JSON.stringify(
                    backup,
                    null,
                    2
                )
            ],
            {
                type:
                    "application/json"
            }
        );


    downloadFile(
        blob,
        "backup-almoxarifado.json"
    );


    showToast(
        "Backup criado."
    );

}


function setupBackupImport() {

    const input =
        document.getElementById(
            "import-backup"
        );


    const fileName =
        document.getElementById(
            "file-name"
        );


    input.addEventListener(
        "change",
        () => {

            if (
                input.files &&
                input.files.length > 0
            ) {

                fileName.textContent =
                    input.files[0].name;

            } else {

                fileName.textContent =
                    "Nenhum arquivo selecionado";

            }

        }
    );


    input.addEventListener(
        "change",
        event => {

            const file =
                event.target.files[0];


            if (!file) {

                return;

            }


            const reader =
                new FileReader();


            reader.onload =
                event => {

                    try {

                        const backup =
                            JSON.parse(
                                event.target.result
                            );


                        if (
                            !backup.data ||
                            !Array.isArray(
                                backup.data.products
                            )
                        ) {

                            throw new Error(
                                "Backup inválido."
                            );

                        }


                        const confirmed =
                            confirm(
                                "Deseja restaurar este backup? Os dados atuais serão substituídos."
                            );


                        if (!confirmed) {

                            input.value = "";

                            fileName.textContent =
                                "Nenhum arquivo selecionado";

                            return;

                        }


                        state = {

                            products:
                                Array.isArray(
                                    backup.data.products
                                )
                                    ? backup.data.products
                                    : [],

                            categories:
                                Array.isArray(
                                    backup.data.categories
                                )
                                    ? backup.data.categories
                                    : [...DEFAULT_CATEGORIES],

                            loans:
                                Array.isArray(
                                    backup.data.loans
                                )
                                    ? backup.data.loans
                                    : [],

                            history:
                                Array.isArray(
                                    backup.data.history
                                )
                                    ? backup.data.history
                                    : []

                        };


                        saveState();

                        renderAll();


                        showToast(
                            "Backup restaurado com sucesso."
                        );


                    } catch (error) {

                        console.error(
                            error
                        );


                        showToast(
                            "O arquivo selecionado não é um backup válido."
                        );

                    }


                    input.value = "";

                    fileName.textContent =
                        "Nenhum arquivo selecionado";

                };


            reader.readAsText(file);

        }
    );

}


/* =========================================================
   APAGAR DADOS
========================================================= */

function setupClearData() {

    document
        .getElementById("clear-data")
        .addEventListener(
            "click",
            () => {

                const confirmed =
                    confirm(
                        "ATENÇÃO!\n\nTodos os produtos, empréstimos e histórico serão apagados.\n\nDeseja continuar?"
                    );


                if (!confirmed) {

                    return;

                }


                state = {

                    products: [],

                    categories: [
                        ...DEFAULT_CATEGORIES
                    ],

                    loans: [],

                    history: []

                };


                saveState();

                resetProductForm();

                renderAll();

                showToast(
                    "Todos os dados foram apagados."
                );

            }
        );

}


/* =========================================================
   LIMPAR HISTÓRICO
========================================================= */

function setupClearHistory() {

    document
        .getElementById("clear-history")
        .addEventListener(
            "click",
            () => {

                if (
                    state.history.length === 0
                ) {

                    showToast(
                        "O histórico já está vazio."
                    );

                    return;

                }


                const confirmed =
                    confirm(
                        "Deseja apagar todo o histórico?"
                    );


                if (!confirmed) {

                    return;

                }


                state.history = [];

                saveState();

                renderAll();

                showToast(
                    "Histórico apagado."
                );

            }
        );

}


/* =========================================================
   MODO ESCURO
========================================================= */

function setupTheme() {

    const button =
        document.getElementById(
            "theme-toggle"
        );


    const savedTheme =
        localStorage.getItem(
            THEME_KEY
        );


    if (savedTheme === "dark") {

        document.body.classList.add(
            "dark"
        );

        button.textContent =
            "☀️ Modo claro";

    }


    button.addEventListener(
        "click",
        () => {

            document.body.classList.toggle(
                "dark"
            );


            const dark =
                document.body.classList.contains(
                    "dark"
                );


            localStorage.setItem(
                THEME_KEY,
                dark
                    ? "dark"
                    : "light"
            );


            button.textContent =
                dark
                    ? "☀️ Modo claro"
                    : "🌙 Modo escuro";

        }
    );

}


/* =========================================================
   DOWNLOAD
========================================================= */

function downloadFile(
    blob,
    filename
) {

    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;

    link.download = filename;


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(url);

}


/* =========================================================
   FORMATAÇÃO
========================================================= */

function formatDate(date) {

    if (!date) {

        return "Não informado";

    }


    const parsed =
        new Date(
            `${date}T00:00:00`
        );


    return parsed.toLocaleDateString(
        "pt-BR"
    );

}


function formatDateTime(date) {

    if (!date) {

        return "Não informado";

    }


    const parsed =
        new Date(date);


    return parsed.toLocaleString(
        "pt-BR"
    );

}


/* =========================================================
   SEGURANÇA
========================================================= */

function escapeHTML(value) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   RENDERIZAÇÃO GERAL
========================================================= */

function renderAll() {

    renderCategories();

    renderProducts();

    renderLoans();

    renderHistory();

    renderDashboard();

}


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadState();


        setupNavigation();

        setupProductForm();

        setupCategoryForm();

        setupFilters();

        setupLoanForm();

        setupBackupImport();

        setupClearData();

        setupClearHistory();

        setupTheme();


        document
            .getElementById("export-csv")
            .addEventListener(
                "click",
                exportCSV
            );


        document
            .getElementById("export-backup")
            .addEventListener(
                "click",
                exportBackup
            );


        renderAll();

    }
);