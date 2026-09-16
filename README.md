# Almoxarifado Tecnológico

Sistema web de gerenciamento de estoque e empréstimos de componentes tecnológicos, desenvolvido como um projeto front-end para o Trabalho de Conclusão de Aprendizagem (TCA).

O sistema foi desenvolvido utilizando **HTML, CSS e JavaScript puro**, sem frameworks e sem necessidade de um servidor ou banco de dados para funcionar.

---

## 1. Objetivo do projeto

O objetivo do Almoxarifado Tecnológico é oferecer uma interface simples para controlar componentes e equipamentos de um almoxarifado.

O sistema permite cadastrar produtos, organizar itens por categorias, acompanhar quantidades disponíveis, registrar empréstimos e devoluções e consultar o histórico das movimentações.

Além disso, a aplicação possui mecanismos de backup e restauração para reduzir o risco de perda dos dados armazenados no navegador.

---

## 2. Tecnologias utilizadas

### HTML5

Responsável pela estrutura da aplicação, incluindo:

- cabeçalho;
- menu de navegação;
- formulários;
- campos de pesquisa e filtros;
- cards;
- modal de empréstimo;
- área de histórico;
- área de backup e restauração.

### CSS3

Responsável pela apresentação visual do sistema:

- layout responsivo;
- cores e variáveis do tema;
- cards;
- botões;
- formulários;
- estados de estoque;
- modo escuro;
- modal;
- mensagens temporárias;
- seletor personalizado de arquivo.

### JavaScript

Responsável pela lógica da aplicação:

- cadastro, edição e exclusão;
- filtros e pesquisa;
- categorias;
- controle de estoque;
- empréstimos;
- devoluções;
- histórico;
- Dashboard;
- exportação CSV;
- backup JSON;
- restauração de backup;
- persistência com `localStorage`;
- modo escuro;
- atualização dinâmica do HTML.

---

## 3. Estrutura do projeto

```text
Trablho-TCA/
│
├── index.html
├── README.md
├── DOCUMENTACAO.md
│
├── css/
│   └── style.css
│
└── js/
    └── app.js
```

> A pasta `.git` pode existir localmente no projeto por causa do controle de versão. Ela não participa do funcionamento do sistema no navegador.

---

## 4. Responsabilidade de cada arquivo

### `index.html`

Define a estrutura visual e semântica da aplicação.

O arquivo contém as seções principais:

- Dashboard;
- Produtos;
- Adicionar/Editar produto;
- Categorias;
- Empréstimos;
- Histórico;
- Sistema.

Também contém os elementos que o JavaScript utiliza para atualizar a interface.

### `css/style.css`

Centraliza toda a aparência da aplicação. O arquivo utiliza variáveis CSS para que cores, bordas, sombras e outros elementos possam ser alterados em um único local.

### `js/app.js`

É o arquivo responsável pela lógica da aplicação. Ele mantém o estado dos dados, registra eventos, executa as regras de negócio, salva os dados e renderiza as informações no HTML.

### `README.md`

Apresenta uma visão geral do projeto, instalação, funcionalidades e arquitetura.

### `DOCUMENTACAO.md`

Contém a documentação técnica mais detalhada, incluindo estrutura de dados, regras de negócio e funcionamento das principais funções.

---

## 5. Funcionalidades

### Dashboard

Apresenta um resumo do estoque e das movimentações recentes.

Entre os indicadores estão:

- quantidade de produtos cadastrados;
- quantidade total de unidades;
- itens com estoque baixo;
- itens sem estoque;
- empréstimos ativos;
- distribuição do estoque por categoria;
- movimentações recentes.

---

### Produtos

A seção de produtos permite consultar e administrar o estoque.

É possível:

- pesquisar por nome;
- pesquisar por código/patrimônio;
- pesquisar por categoria;
- filtrar por categoria;
- filtrar por disponibilidade;
- filtrar por estoque baixo;
- filtrar por ausência de estoque;
- filtrar por itens emprestados;
- ordenar por nome;
- ordenar por quantidade;
- ordenar por categoria;
- ordenar pelos produtos mais recentes;
- editar produtos;
- excluir produtos;
- iniciar um empréstimo.

---

### Cadastro e edição

Cada produto pode possuir:

- nome;
- código/patrimônio;
- categoria;
- quantidade total;
- estoque mínimo;
- localização;
- descrição.

O código do produto precisa ser único.

Quando um produto está sendo editado, o mesmo formulário é reutilizado. O campo oculto `editing-id` identifica se a operação é de cadastro ou atualização.

---

### Categorias

O sistema começa com categorias padrão:

- Computadores;
- Periféricos;
- Cabos e Adaptadores;
- Redes;
- Componentes;
- Armazenamento;
- Energia;
- Outros.

Também é possível criar novas categorias.

Uma categoria que esteja sendo utilizada por um produto não pode ser excluída. Essa regra evita que produtos fiquem associados a uma categoria inexistente.

---

### Empréstimos

O sistema permite registrar o empréstimo de uma ou mais unidades de um produto.

Cada empréstimo possui:

- produto;
- responsável;
- quantidade;
- motivo;
- data do empréstimo;
- prazo de devolução;
- status.

O sistema impede o empréstimo de uma quantidade maior do que a disponibilidade atual.

---

### Devolução

Quando um componente é devolvido, o empréstimo deixa de ser considerado ativo e recebe a data/hora da devolução.

A quantidade disponível do produto é recalculada automaticamente porque o sistema considera somente os empréstimos ativos ao determinar quantas unidades estão fora do estoque.

---

### Status de empréstimos

Os empréstimos podem apresentar diferentes situações:

- **No prazo**;
- **Devolução próxima**;
- **Atrasado**;
- **Devolvido**.

Isso permite identificar rapidamente quais componentes ainda estão fora do almoxarifado e quais precisam de atenção.

---

### Histórico

As principais operações são registradas no histórico, incluindo:

- criação de produto;
- edição de produto;
- exclusão de produto;
- alterações de estoque;
- empréstimos;
- devoluções.

São mantidas as **200 movimentações mais recentes** para evitar crescimento indefinido do armazenamento local.

---

### Exportação CSV

Os produtos podem ser exportados para um arquivo CSV.

Esse formato é útil para abrir os dados em programas de planilhas e realizar análises externas.

A geração acontece diretamente no navegador, sem necessidade de API.

---

### Backup e restauração

O sistema possui duas operações diferentes:

**Exportar backup:**

Cria um arquivo JSON contendo o estado completo da aplicação:

```text
products
categories
loans
history
```

**Restaurar backup:**

Permite selecionar um arquivo JSON previamente exportado e restaurar os dados.

O seletor de arquivo foi personalizado visualmente para manter a identidade da aplicação e mostrar o nome do arquivo selecionado.

---

### Modo escuro

O sistema possui modo claro e modo escuro.

A preferência do usuário é salva no `localStorage` utilizando uma chave independente dos dados do estoque.

---

## 6. Persistência dos dados

A aplicação utiliza o `localStorage` do navegador.

A chave atual utilizada pelo sistema é:

```text
almoxarifado_tecnologico_v4
```

Os dados são armazenados como JSON.

A estrutura principal é semelhante a:

```javascript
{
    products: [],
    categories: [],
    loans: [],
    history: []
}
```

Isso significa que os dados permanecem disponíveis após recarregar a página, desde que o armazenamento do navegador não seja apagado.

### Limitação

O `localStorage` é local ao navegador/dispositivo. Portanto, os dados não são compartilhados automaticamente entre computadores ou usuários.

Para um sistema real multiusuário, seria necessário um back-end e um banco de dados.

---

## 7. Segurança e validação

O projeto não possui autenticação porque foi desenvolvido como uma aplicação front-end para fins acadêmicos.

Mesmo assim, algumas medidas simples foram implementadas:

- validação de campos obrigatórios;
- prevenção de códigos duplicados;
- confirmação antes de exclusões;
- bloqueio da exclusão de produtos com empréstimo ativo;
- bloqueio da exclusão de categorias utilizadas por produtos;
- validação da quantidade disponível antes do empréstimo;
- função `escapeHTML()` para impedir que textos inseridos pelo usuário sejam interpretados como HTML quando inseridos em templates.

---

## 8. Como executar

Não é necessário instalar HTML, CSS ou JavaScript no VS Code.

### Opção 1: abrir diretamente

Abra `index.html` em um navegador.

### Opção 2: Live Server

No VS Code, a extensão Live Server pode ser utilizada para iniciar um servidor local e atualizar a página automaticamente durante o desenvolvimento.

---

## 9. Fluxo básico de utilização

### Cadastrar um produto

1. Acesse **Adicionar**.
2. Informe nome e código.
3. Selecione uma categoria.
4. Informe a quantidade.
5. Informe o estoque mínimo.
6. Opcionalmente, informe localização e descrição.
7. Clique em **Salvar produto**.

### Editar

1. Acesse **Produtos**.
2. Localize o produto.
3. Clique em **Editar**.
4. Altere os dados.
5. Salve novamente.

### Emprestar

1. Acesse **Produtos**.
2. Escolha um produto disponível.
3. Clique em **Emprestar**.
4. Informe o responsável, quantidade, motivo e prazo.
5. Registre o empréstimo.

### Devolver

1. Acesse **Empréstimos**.
2. Localize o empréstimo ativo.
3. Clique em **Registrar devolução**.

### Backup

1. Acesse **Sistema**.
2. Clique em **Exportar backup**.
3. Guarde o arquivo JSON em um local seguro.

Para restaurar:

1. Acesse **Sistema**.
2. Clique em **Selecionar backup**.
3. Escolha o arquivo JSON.
4. Confirme a restauração quando solicitado.

---

## 10. Melhorias futuras

O projeto pode evoluir para uma arquitetura full-stack com:

- API REST;
- Node.js/Express ou outra tecnologia de back-end;
- MySQL;
- autenticação de usuários;
- permissões por perfil;
- banco de dados central;
- acesso simultâneo por vários computadores;
- QR Code ou código de barras;
- relatórios mais avançados;
- controle de usuários e setores;
- registro de movimentações no servidor.

Para a versão atual do TCA, entretanto, HTML + CSS + JavaScript + `localStorage` são suficientes para demonstrar as principais funcionalidades sem adicionar complexidade desnecessária.

---

## 11. Versionamento

O projeto utiliza Git para controle de versão.

Uma convenção recomendada para novas funcionalidades é utilizar branches com nomes descritivos, por exemplo:

```bash
git checkout -b feature/nome-da-funcionalidade
```

Para commits, pode-se utilizar o padrão Conventional Commits:

```bash
git commit -m "feat: adiciona nova funcionalidade"
```

---

## 12. Autor

Projeto acadêmico desenvolvido para o Trabalho de Conclusão de Aprendizagem (TCA).
