# Almoxarifado Tecnológico

Sistema front-end de gerenciamento de estoque feito somente com HTML, CSS e JavaScript.

## Funcionalidades

- Cadastro de produtos/componentes
- Código/patrimônio único
- Categorias
- Pesquisa por nome, código ou categoria
- Filtro por categoria
- Listagem de produtos
- Edição
- Exclusão
- Controle de quantidade
- Estoque mínimo
- Alertas de estoque baixo
- Dashboard
- Persistência com `localStorage`
- Dados separados logicamente em produtos e categorias

## Como executar

Não é necessário instalar HTML, CSS ou JavaScript no VS Code.

Abra a pasta no VS Code e execute `index.html` no navegador. A forma mais prática é usar a extensão Live Server, mas ela não é obrigatória.

## Persistência

Os dados ficam armazenados no `localStorage` do navegador, usando a chave:

`almoxarifado_tecnologico_v1`

Assim, fechar o navegador ou desligar o computador não apaga os produtos.

### Importante

`localStorage` é persistência local. Os dados ficam naquele navegador/dispositivo.

Se o projeto futuramente precisar de:
- vários usuários;
- login;
- acesso de vários computadores;
- banco de dados central;
- histórico de movimentações;
- entrada/saída de estoque;
- backup no servidor;

o próximo passo é criar um back-end e usar um banco de dados, por exemplo MySQL.
