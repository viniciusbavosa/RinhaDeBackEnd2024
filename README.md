# [Rinha de Backend 2024](https://github.com/zanfranceschi/rinha-de-backend-2024-q1)

Essa é a minha implementação do desafio da Rinha de Backend 2024. O desafio consiste em estruturar uma API para lidar com transações bancarias. O conceito trabalhado nessa rinha é **controle de concorrencia**. API construida e testada puramente com Node.

# Instalação

```
  git clone https://github.com/viniciusbavosa/RinhaDeBackEnd2024.git

  cd RinhaDeBackEnd2024

  npm run server
```

\*O servidor estará ouvindo por requisições na porta 9999. Para testar a API, utilize o comando `npm run test`.

---

## Transações

**Requisição**

`POST /clientes/[id]/transacoes`

Onde

- `[id]` (na URL) deve ser um número inteiro representando a identificação do cliente.
- `valor` deve ser um número inteiro positivo que representa centavos (não vamos trabalhar com frações de centavos). Por exemplo, R$ 10 são 1000 centavos.
- `tipo` deve ser apenas `c` para crédito ou `d` para débito.
- `descricao` deve ser uma string de 1 a 10 caracteres.

Todos os campos são obrigatórios.

**Resposta**

`HTTP 200 OK`

```json
{
  "limite": 100000,
  "saldo": -9098
}
```

Onde

- `limite` deve ser o limite cadastrado do cliente.
- `saldo` deve ser o novo saldo após a conclusão da transação.

_Obrigatoriamente, o http status code de requisições para transações bem sucedidas deve ser 200!_

**Regras**
Uma transação de débito **nunca** pode deixar o saldo do cliente menor que seu limite disponível. Por exemplo, um cliente com limite de 1000 (R\$ 10) nunca deverá ter o saldo menor que -1000 (R\$ -10). Nesse caso, um saldo de -1001 ou menor significa inconsistência na Rinha de Backend!

Se uma requisição para débito for deixar o saldo inconsistente, a API deve retornar HTTP Status Code 422 sem completar a transação! O corpo da resposta nesse caso não será testado e você pode escolher como o representar. HTTP 422 também deve ser retornado caso os campos do payload estejam fora das especificações como, por exemplo, uma string maior do que 10 caracteres para o campo `descricao` ou algo diferente de `c` ou `d` para o campo `tipo`. Se para o campo `valor` um número não inteiro for especificado, você poderá retornar HTTP 422 ou 400.

Se o atributo `[id]` da URL for de uma identificação não existente de cliente, a API deve retornar HTTP Status Code 404. O corpo da resposta nesse caso não será testado e você pode escolher como o representar. Se a API retornar algo como HTTP 200 informando que o cliente não foi encontrado no corpo da resposta ou HTTP 204 sem corpo, ficarei extremamente deprimido e a Rinha será cancelada para sempre.

## Extrato

**Requisição**

`GET /clientes/[id]/extrato`

Onde

- `[id]` (na URL) deve ser um número inteiro representando a identificação do cliente.

**Resposta**

`HTTP 200 OK`

```json
{
  "saldo": {
    "total": -9098,
    "data_extrato": "2024-01-17T02:34:41.217753Z",
    "limite": 100000
  },
  "ultimas_transacoes": [
    {
      "valor": 10,
      "tipo": "c",
      "descricao": "descricao",
      "realizada_em": "2024-01-17T02:34:38.543030Z"
    },
    {
      "valor": 90000,
      "tipo": "d",
      "descricao": "descricao",
      "realizada_em": "2024-01-17T02:34:38.543030Z"
    }
  ]
}
```

Onde

- `saldo`
  - `total` deve ser o saldo total atual do cliente (não apenas das últimas transações seguintes exibidas).
  - `data_extrato` deve ser a data/hora da consulta do extrato.
  - `limite` deve ser o limite cadastrado do cliente.
- `ultimas_transacoes` é uma lista ordenada por data/hora das transações de forma decrescente contendo até as 10 últimas transações com o seguinte:
  - `valor` deve ser o valor da transação.
  - `tipo` deve ser `c` para crédito e `d` para débito.
  - `descricao` deve ser a descrição informada durante a transação.
  - `realizada_em` deve ser a data/hora da realização da transação.

**Regras**
Se o atributo `[id]` da URL for de uma identificação não existente de cliente, a API deve retornar HTTP Status Code 404. O corpo da resposta nesse caso não será testado e você pode escolher como o representar. Já sabe o que acontece se sua API retornar algo na faixa 2XX, né? Agradecido.

## Cadastro Inicial de Clientes

Para haver ênfase em concorrência durante o teste, poucos clientes devem ser cadastrados e testados. Por isso, apenas cinco clientes, com os seguintes IDs, limites e saldos iniciais, devem ser previamente cadastrados para o teste – isso é imprescindível!

| id  | limite   | saldo inicial |
| --- | -------- | ------------- |
| 1   | 100000   | 0             |
| 2   | 80000    | 0             |
| 3   | 1000000  | 0             |
| 4   | 10000000 | 0             |
| 5   | 500000   | 0             |

Obs.: Não cadastre um cliente com o ID 6 especificamente, pois parte do teste é verificar se o cliente com o ID 6 realmente não existe e a API retorna HTTP 404!
