# Documentação Técnica — Almoxarifado Tecnológico

## 1. Arquitetura da aplicação

O projeto utiliza uma arquitetura simples de aplicação front-end baseada em três camadas lógicas:

```text
HTML
 │
 │ estrutura e elementos da interface
 ▼
JavaScript
 │
 ├── regras de negócio
 ├── gerenciamento do estado
 ├── eventos
 └── persistência
 │
 ▼
localStorage
```

O CSS funciona transversalmente, controlando a apresentação da interface.

Não existe servidor, API ou banco de dados externo nesta versão.

---

## 2. Estado da aplicação

O objeto principal é `state`:

```javascript
let state = {
    products: [],
    categories: [...DEFAULT_CATEGORIES],
    loans: [],
    history: []
};
```

### `products`

Armazena os produtos cadastrados.

Cada produto pode conter:

```text
id
name
code
category
quantity
minimum
location
description
createdAt
```

### `categories`

Armazena os nomes das categorias disponíveis.

### `loans`

Armazena os empréstimos registrados.

Um empréstimo contém informações como:

```text
id
productId
productName
borrower
quantity
reason
dueDate
createdAt
returnedAt
status
```

### `history`

Armazena os registros das movimentações do sistema.

Cada registro possui:

```text
id
type
message
date
```

---

## 3. Persistência

A persistência é realizada pelas funções:

```javascript
saveState();
loadState();
```

`saveState()` converte o objeto `state` para JSON e salva o resultado no `localStorage`.

`loadState()` faz o processo inverso: recupera o JSON e reconstrói o objeto utilizado pela aplicação.

A chave atual é:

```text
almoxarifado_tecnologico_v4
```

---

## 4. Renderização

O projeto utiliza uma abordagem de renderização manual do DOM.

As principais funções são:

```text
renderCategories()
renderProducts()
renderLoans()
renderDashboard()
renderCategorySummary()
renderRecentHistory()
renderHistory()
renderAll()
```

Quando os dados mudam, `renderAll()` chama os renderizadores para atualizar a interface.

Isso evita que diferentes partes do sistema fiquem mostrando dados antigos.

---

## 5. Cadastro de produtos

O formulário de produto possui dois comportamentos.

### Cadastro

Quando `editing-id` está vazio, o sistema cria um novo objeto e adiciona o produto ao array `state.products`.

### Edição

Quando `editing-id` possui um valor, o sistema procura o produto pelo ID e atualiza seus dados.

Essa estratégia permite reutilizar o mesmo formulário para duas operações diferentes.

---

## 6. Controle de estoque

O sistema separa a quantidade total cadastrada da quantidade atualmente emprestada.

A quantidade disponível pode ser entendida como:

```text
Disponível = Quantidade total - Quantidade emprestada em empréstimos ativos
```

A função responsável pelo cálculo é:

```javascript
getBorrowedQuantity(productId)
```

Ela percorre os empréstimos e soma somente aqueles que possuem status `active`.

Essa abordagem evita manter uma segunda variável de estoque disponível que poderia ficar inconsistente.

---

## 7. Status dos produtos

A função:

```javascript
getProductStatus(product)
```

determina o estado visual de cada produto.

Os filtros da interface utilizam esses estados para localizar rapidamente produtos disponíveis, com estoque baixo, sem estoque ou emprestados.

---

## 8. Empréstimos

Para registrar um empréstimo, o sistema verifica:

1. se o produto existe;
2. se o responsável foi informado;
3. se a quantidade é válida;
4. se existe quantidade suficiente disponível.

Depois da validação, o registro recebe status:

```text
active
```

O empréstimo também é registrado no histórico.

---

## 9. Devoluções

A devolução não cria um novo produto nem altera diretamente a quantidade total cadastrada.

Em vez disso, o empréstimo é atualizado:

```javascript
loan.status = "returned";
loan.returnedAt = new Date().toISOString();
```

Como `getBorrowedQuantity()` ignora empréstimos devolvidos, as unidades deixam automaticamente de ser contabilizadas como emprestadas.

Isso mantém a regra de estoque centralizada.

---

## 10. Prazo de devolução

A função:

```javascript
getLoanStatus(loan)
```

compara a data atual com o prazo do empréstimo.

O sistema diferencia:

- devolvido;
- atrasado;
- devolução próxima;
- no prazo.

Isso transforma uma simples lista de empréstimos em uma ferramenta de acompanhamento.

---

## 11. Histórico

A função:

```javascript
addHistory(type, message)
```

é responsável por registrar eventos.

Exemplos:

```text
create
edit
delete
stock
loan
return
```

Os eventos são inseridos no início do array e a aplicação mantém somente os 200 registros mais recentes.

---

## 12. Segurança no HTML dinâmico

Como alguns dados fornecidos pelo usuário são inseridos em templates HTML, o projeto possui:

```javascript
escapeHTML(value)
```

Essa função converte caracteres especiais em entidades HTML antes que o conteúdo seja interpretado pelo navegador.

Isso é especialmente importante para campos como:

- nome;
- descrição;
- responsável;
- motivo do empréstimo.

---

## 13. Exportação CSV

A função `exportCSV()` transforma os produtos em linhas CSV.

O arquivo é criado com `Blob` e baixado usando a função auxiliar:

```javascript
downloadFile(content, filename, type)
```

Nenhum servidor é necessário.

---

## 14. Backup JSON

O backup JSON é diferente da exportação CSV.

### CSV

Tem como objetivo facilitar a leitura dos produtos em programas de planilhas.

### JSON

Tem como objetivo preservar o estado completo da aplicação para restauração.

O JSON contém:

```text
products
categories
loans
history
```

---

## 15. Restauração de backup

O usuário seleciona um arquivo `.json` por meio do campo de upload personalizado.

O navegador disponibiliza o arquivo ao JavaScript por meio da API `FileReader`.

O processo é:

```text
Selecionar arquivo
       ↓
FileReader
       ↓
JSON.parse()
       ↓
Validar estrutura
       ↓
Substituir state
       ↓
saveState()
       ↓
renderAll()
```

O arquivo não é enviado para nenhum servidor.

---

## 16. Tema claro e escuro

O CSS utiliza variáveis para as cores principais.

Exemplo:

```css
:root {
    --background: #f4f7fb;
    --surface: #ffffff;
    --text: #172033;
}
```

Quando o elemento `body` recebe a classe `dark`, as variáveis são redefinidas.

```css
body.dark {
    --background: #0f172a;
    --surface: #1e293b;
    --text: #f1f5f9;
}
```

A preferência é armazenada separadamente em:

```text
almoxarifado_theme
```

---

## 17. Responsabilidade das principais funções

| Função | Responsabilidade |
|---|---|
| `generateId()` | Criar IDs para registros |
| `saveState()` | Salvar dados no navegador |
| `loadState()` | Carregar dados do navegador |
| `showToast()` | Exibir mensagens temporárias |
| `setupNavigation()` | Controlar navegação |
| `renderCategories()` | Atualizar categorias |
| `setupCategoryForm()` | Cadastrar categorias |
| `deleteCategory()` | Excluir categorias válidas |
| `addHistory()` | Registrar movimentações |
| `setupProductForm()` | Cadastrar/editar produtos |
| `editProduct()` | Atualizar produto |
| `startEditProduct()` | Carregar produto para edição |
| `deleteProduct()` | Excluir produto |
| `getProductStatus()` | Determinar status do estoque |
| `getBorrowedQuantity()` | Calcular unidades emprestadas |
| `renderProducts()` | Exibir produtos |
| `openLoanModal()` | Abrir formulário de empréstimo |
| `setupLoanForm()` | Criar empréstimos |
| `returnLoan()` | Registrar devoluções |
| `getLoanStatus()` | Determinar situação do prazo |
| `renderLoans()` | Exibir empréstimos |
| `renderDashboard()` | Atualizar indicadores |
| `renderHistory()` | Exibir histórico |
| `setupFilters()` | Controlar busca e filtros |
| `exportCSV()` | Gerar CSV |
| `exportBackup()` | Gerar backup JSON |
| `setupBackupImport()` | Restaurar backup |
| `setupTheme()` | Controlar modo claro/escuro |
| `downloadFile()` | Criar downloads no navegador |
| `escapeHTML()` | Escapar texto inserido em HTML |
| `renderAll()` | Sincronizar a interface inteira |

---

## 18. Regras de negócio

### Produto

- nome é obrigatório;
- código é obrigatório;
- código não pode ser duplicado;
- quantidade não pode ser negativa;
- estoque mínimo não pode ser negativo.

### Categoria

- nome não pode ser vazio;
- nomes duplicados não são permitidos;
- categorias utilizadas por produtos não podem ser excluídas.

### Empréstimo

- produto precisa existir;
- responsável é obrigatório;
- quantidade deve ser maior que zero;
- quantidade não pode ultrapassar a disponibilidade;
- produto com zero unidades disponíveis não pode ser emprestado.

### Exclusão

- produto com empréstimo ativo não pode ser excluído.

---

## 19. Fluxo de uma alteração de dados

Um exemplo de fluxo para cadastro de produto é:

```text
Usuário preenche formulário
          ↓
Evento submit
          ↓
Validação
          ↓
Criação do objeto
          ↓
state.products.push(...)
          ↓
addHistory(...)
          ↓
saveState()
          ↓
renderAll()
          ↓
Mensagem de sucesso
```

Esse padrão é repetido, com pequenas diferenças, nas outras operações do sistema.

---

## 20. Por que não foi utilizado MySQL/API?

A versão atual foi construída como uma aplicação front-end acadêmica.

Para o objetivo do TCA, o uso de `localStorage` permite demonstrar:

- manipulação do DOM;
- eventos;
- formulários;
- validação;
- arrays e objetos;
- regras de negócio;
- persistência;
- filtros;
- exportação de arquivos;
- gerenciamento de estado.

Adicionar uma API e um banco de dados seria uma evolução válida, mas aumentaria consideravelmente a complexidade do projeto e exigiria uma infraestrutura de back-end.

---

## 21. Evolução recomendada

Se o projeto precisar se tornar um sistema real para múltiplos usuários, a evolução recomendada seria:

```text
Front-end
HTML + CSS + JavaScript
        ↓
API REST
        ↓
Back-end
        ↓
MySQL
```

Nesse cenário, produtos, usuários, empréstimos e histórico deixariam de ficar somente no navegador e passariam a ser armazenados centralmente.
