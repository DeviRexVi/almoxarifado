/* =========================================================
   ALMOXARIFADO TECNOLÓGICO
   Sistema de controle de estoque
========================================================= */


/*
 * ARQUITETURA DO JAVASCRIPT
 * -------------------------
 * Este arquivo concentra toda a lógica da aplicação. O projeto utiliza uma
 * abordagem simples de front-end, sem servidor ou banco de dados externo.
 *
 * 1. O objeto `state` funciona como a memória atual da aplicação.
 * 2. `localStorage` mantém esse estado salvo no navegador.
 * 3. As funções `render...` transformam os dados do estado em elementos HTML.
 * 4. As funções `setup...` registram eventos nos formulários, botões e filtros.
 * 5. Operações que alteram dados também registram movimentações no histórico.
 *
 * Dessa forma, a responsabilidade fica separada em três grupos principais:
 * dados/persistência, regras de negócio e interface (DOM).
 */

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

/**
 * Gera um identificador único para produtos, empréstimos e registros do histórico.
 * A combinação entre o horário atual e uma sequência aleatória reduz bastante a
 * possibilidade de dois registros receberem o mesmo ID.
 * @returns {string} Identificador gerado para o registro.
 */

function generateId() {

    return Date.now().toString() +
        Math.random()
            .toString(36)
            .substring(2, 9);

}


/**
 * Persiste o estado atual da aplicação no armazenamento local do navegador.
 * JSON.stringify transforma o objeto JavaScript em texto para que ele possa ser
 * armazenado pelo localStorage. Esta função deve ser chamada depois de alterações
 * que precisam continuar disponíveis após recarregar ou fechar a página.
 */

function saveState() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(state)
    );

}


/**
 * Recupera os dados salvos anteriormente no localStorage.
 * Também valida cada coleção antes de colocá-la no estado, evitando que dados
 * inválidos ou um backup incompleto quebrem a aplicação. Se não existir um
 * armazenamento anterior, o estado inicial é salvo pela primeira vez.
 */

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

/**
 * Exibe uma pequena mensagem temporária para informar o resultado de uma ação.
 * O elemento é criado dinamicamente e removido após alguns segundos, evitando
 * que mensagens antigas permaneçam ocupando espaço na interface.
 * @param {string} message Mensagem que será apresentada ao usuário.
 */

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

/**
 * Configura a navegação principal do sistema.
 * Cada botão possui o atributo data-section, que indica qual section deve ser
 * exibida. A função também controla a classe `active` para destacar a seção atual.
 */

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

/**
 * Atualiza todas as interfaces que dependem das categorias cadastradas.
 * A mesma fonte de dados alimenta o select do formulário, o filtro de produtos
 * e a lista de gerenciamento de categorias. Assim, uma alteração é refletida
 * em toda a aplicação após a renderização.
 */

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

/**
 * Registra o evento de criação de uma nova categoria.
 * O formulário impede categorias vazias e verifica duplicidades ignorando
 * diferenças entre letras maiúsculas e minúsculas.
 */

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


/**
 * Remove uma categoria, desde que ela não esteja sendo utilizada por nenhum produto.
 * Essa validação protege a integridade dos dados e evita produtos apontando para
 * uma categoria que deixou de existir.
 * @param {string} category Nome exato da categoria a ser removida.
 */

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

/**
 * Adiciona uma movimentação ao histórico do sistema.
 * Os registros são inseridos no início da lista para que os acontecimentos mais
 * recentes apareçam primeiro. Para evitar crescimento indefinido do armazenamento,
 * apenas as 200 movimentações mais recentes são mantidas.
 * @param {string} type Tipo interno da movimentação.
 * @param {string} message Texto que será mostrado ao usuário.
 */

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

/**
 * Configura o formulário responsável por cadastrar e editar produtos.
 * O mesmo formulário atende aos dois casos: quando `editing-id` está vazio, um
 * novo produto é criado; quando possui um ID, os dados existentes são atualizados.
 * Também realiza as validações de campos e impede códigos duplicados.
 */

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


/**
 * Atualiza os dados de um produto existente.
 * Além da alteração cadastral, compara a quantidade anterior com a nova para
 * registrar no histórico uma movimentação específica de estoque quando necessário.
 * @param {string} id Identificador do produto.
 * @param {Object} data Novos dados que serão aplicados ao produto.
 */

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


/**
 * Carrega os dados de um produto no formulário de cadastro/edição.
 * A função também muda o título do formulário e revela o botão de cancelamento,
 * deixando claro para o usuário que ele está editando um registro existente.
 * @param {string} id Identificador do produto selecionado.
 */

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


/**
 * Limpa o formulário e retorna a interface ao modo de cadastro de um novo produto.
 * O ID de edição é apagado e o botão de cancelamento deixa de ser exibido.
 */

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


/**
 * Exclui um produto após validar se ele não possui empréstimo ativo.
 * A confirmação adicional evita exclusões acidentais e a operação também é
 * registrada no histórico para manter rastreabilidade.
 * @param {string} id Identificador do produto a ser excluído.
 */

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

/**
 * Determina o status atual de estoque de um produto.
 * A classificação considera primeiro a quantidade disponível, depois o estoque
 * mínimo e, por fim, a existência de unidades emprestadas. O resultado é usado
 * pelos filtros e pelos indicadores visuais dos cards.
 * @param {Object} product Produto que será analisado.
 * @returns {{key:string,label:string,className:string}} Status padronizado do produto.
 */

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


/**
 * Soma a quantidade de unidades que estão em empréstimos ativos para um produto.
 * O valor é calculado a partir dos empréstimos em vez de ser armazenado separadamente,
 * evitando inconsistência entre estoque e registros de empréstimo.
 * @param {string} productId Identificador do produto.
 * @returns {number} Quantidade atualmente emprestada.
 */

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

/**
 * Renderiza a lista de produtos de acordo com os filtros e a ordenação selecionados.
 * Cada card apresenta informações do estoque e ações como editar, excluir e emprestar.
 * A função também calcula a quantidade disponível considerando os empréstimos ativos.
 */

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

/**
 * Abre o modal de empréstimo para um produto específico.
 * O limite máximo de quantidade disponível é aplicado ao campo do modal para
 * impedir que o usuário empreste mais unidades do que existem no estoque.
 * @param {string} productId Identificador do produto selecionado.
 */

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


/**
 * Fecha o modal de empréstimo e limpa o formulário para a próxima operação.
 */

function closeLoanModal() {

    document
        .getElementById("loan-modal")
        .classList.add("hidden");

}


/**
 * Configura o formulário de criação de empréstimos.
 * Valida responsável, quantidade e disponibilidade antes de criar o registro.
 * O empréstimo recebe data de criação, prazo de devolução e status ativo.
 */

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


/**
 * Registra a devolução de um empréstimo ativo.
 * A operação altera o status, grava a data/hora da devolução e adiciona uma
 * movimentação no histórico. O estoque disponível passa a refletir automaticamente
 * a devolução porque a quantidade emprestada é recalculada pelos empréstimos ativos.
 * @param {string} loanId Identificador do empréstimo devolvido.
 */

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

/**
 * Calcula o status de prazo de um empréstimo.
 * Empréstimos encerrados são marcados como devolvidos; empréstimos ativos podem
 * estar atrasados, próximos do vencimento ou dentro do prazo.
 * @param {Object} loan Empréstimo que será analisado.
 * @returns {{label:string,className:string}} Status visual do empréstimo.
 */

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

/**
 * Renderiza todos os empréstimos, priorizando os registros mais recentes.
 * Para cada empréstimo são exibidos produto, responsável, quantidade, motivo,
 * prazo e status. Em empréstimos ativos aparece a ação para registrar a devolução.
 */

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

/**
 * Atualiza os indicadores principais do Dashboard.
 * Os números são derivados do estado atual, permitindo visualizar rapidamente
 * quantidade de produtos, estoque baixo, itens sem estoque e empréstimos ativos.
 */

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


/**
 * Monta o resumo visual de estoque agrupado por categoria.
 * Para cada categoria são calculadas as quantidades e a proporção relativa,
 * facilitando a leitura da distribuição do estoque.
 */

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

/**
 * Mostra no Dashboard as movimentações mais recentes do sistema.
 * Esta visão é apenas um resumo; a seção Histórico apresenta a lista completa.
 */

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

/**
 * Renderiza o histórico completo de movimentações armazenado no estado.
 * O histórico serve como trilha de auditoria simples das operações realizadas.
 */

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


/**
 * Traduz o código interno de uma movimentação para um texto compreensível.
 * Isso permite manter valores curtos e consistentes no estado e apresentar
 * descrições amigáveis na interface.
 * @param {string} type Código interno do tipo de movimentação.
 * @returns {string} Nome exibido para o tipo informado.
 */

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

/**
 * Registra os eventos dos filtros, da busca e da ordenação da lista de produtos.
 * Qualquer alteração nesses controles dispara uma nova renderização dos produtos,
 * sem modificar os dados originais armazenados no estado.
 */

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

/**
 * Gera um arquivo CSV contendo os produtos cadastrados.
 * O arquivo é criado no navegador e disponibilizado para download sem depender
 * de servidor ou API externa.
 */

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

/**
 * Cria um backup completo do estado da aplicação em formato JSON.
 * Diferentemente do CSV, o backup preserva produtos, categorias, empréstimos e histórico,
 * permitindo restaurar a aplicação posteriormente.
 */

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


/**
 * Configura a restauração de um backup JSON selecionado pelo usuário.
 * O arquivo é lido localmente com FileReader, validado e só então incorporado ao estado.
 * Nenhum arquivo é enviado para um servidor.
 */

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

/**
 * Configura a ação de apagar todos os dados do sistema.
 * A operação exige confirmação e recria as categorias padrão, deixando produtos,
 * empréstimos e histórico vazios.
 */

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

/**
 * Configura o botão responsável por limpar somente o histórico.
 * Produtos, categorias e empréstimos permanecem preservados.
 */

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

/**
 * Controla o tema claro/escuro da aplicação.
 * A preferência é salva separadamente no localStorage para que o tema escolhido
 * seja mantido entre as sessões do navegador.
 */

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

/**
 * Cria temporariamente um Blob e um link invisível para iniciar um download no navegador.
 * Essa abordagem permite gerar arquivos CSV e JSON diretamente no front-end.
 * @param {string} content Conteúdo do arquivo.
 * @param {string} filename Nome sugerido para o arquivo baixado.
 * @param {string} type MIME type do arquivo.
 */

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

/**
 * Converte uma data para o formato brasileiro usado na interface.
 * @param {string|Date} date Data que será formatada.
 * @returns {string} Data no formato DD/MM/AAAA.
 */

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


/**
 * Converte uma data para o formato brasileiro com data e horário.
 * @param {string|Date} date Data que será formatada.
 * @returns {string} Data e hora formatadas.
 */

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

/**
 * Escapa caracteres especiais antes de inserir valores fornecidos pelo usuário em HTML.
 * Essa proteção evita que nomes, descrições ou motivos contendo marcação HTML sejam
 * interpretados como código pelo navegador.
 * @param {*} value Valor que será convertido e escapado.
 * @returns {string} Texto seguro para inserção em HTML.
 */

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

/**
 * Centraliza a atualização da interface.
 * Sempre que uma operação altera o estado, esta função chama os renderizadores
 * necessários para manter Dashboard, produtos, categorias, empréstimos e histórico
 * sincronizados com os dados atuais.
 */

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