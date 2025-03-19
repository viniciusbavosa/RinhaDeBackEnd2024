import http from "http";
import { once } from "events";

// The api returns a JSON Object regardless of whether it returns a body or not. This is necessary for testing. Need to debug.

export const server = http.createServer((req, res) => {
  routes(req, res);
});

const clients = [
  {
    id: 1,
    limit: 100000,
    balance: 0,
    historyTransaction: [],
  },
  {
    id: 2,
    limit: 80000,
    balance: 0,
    historyTransaction: [],
  },
  {
    id: 3,
    limit: 1000000,
    balance: 0,
    historyTransaction: [],
  },
  {
    id: 4,
    limit: 10000000,
    balance: 0,
    historyTransaction: [],
  },
  {
    id: 5,
    limit: 500000,
    balance: 0,
    historyTransaction: [],
  },
];

const statusCode = {
  200: {
    status: 200,
    message: "OK",
  },
  400: {
    status: 400,
    message: "Bad Request",
  },
  404: {
    status: 404,
    message: "Not Found",
  },
  422: {
    status: 422,
    message: "Unprocessable Entity",
  },
};

function parseTransaction(data, id) {
  const client = clients.find((value) => value.id == id);

  const transactions = {
    c: creditTransaction,
    d: debitTransaction,
  };

  function creditTransaction() {
    if (client.balance + data.valor > client.limit) return false;
    client.balance += data.valor;
    client.historyTransaction.push({
      ...data,
      at: new Date().toISOString(),
    });

    return {
      limite: client.limit,
      saldo: client.balance,
    };
  }

  function debitTransaction() {
    if (client.balance - data.valor < client.limit * -1) {
      return false;
    }
    client.balance = client.balance - data.valor;

    client.historyTransaction.push({
      ...data,
      at: new Date().toISOString(),
    });

    return {
      limite: client.limit,
      saldo: client.balance,
    };
  }

  return Object.hasOwn(transactions, data.tipo)
    ? transactions[data.tipo]()
    : false;
}

async function transactionRoute(req, res, clientId) {
  const { valor, tipo, descricao } = JSON.parse(await once(req, "data"));
  const transactionValue = Number(valor);

  if (
    !Number.isInteger(transactionValue) ||
    transactionValue < 0 ||
    (tipo !== "c" && tipo !== "d") ||
    descricao.length > 10 ||
    !descricao.length
  ) {
    res.statusCode = statusCode[422].status;
    res.statusMessage = statusCode[422].message;
    res.end("{}");
    return;
  }

  const transactionResponse = parseTransaction(
    { valor, tipo, descricao },
    clientId
  );

  if (transactionResponse) {
    res.statusCode = statusCode[200].status;
    res.statusMessage = statusCode[200].message;
    res.write(JSON.stringify(transactionResponse));
    res.end();
    return;
  } else {
    res.statusCode = statusCode[422].status;
    res.statusMessage = statusCode[422].message;
    res.end("{}");
    return;
  }
}

async function receiptRoute(req, res, clientId) {
  const client = clients.find((value) => value.id == clientId);

  const receipt = {
    saldo: {
      total: client.balance,
      data_extrato: new Date().toISOString(),
      limite: client.limit,
    },
    ultimas_transacoes: [...client.historyTransaction],
  };
  res.write(JSON.stringify(receipt));
  res.end();
  return;
}

const routes = async (req, res) => {
  const url = req.url.split("/");
  const clientId = Number(url[2]);

  const hasClient = clients.find((c) => c.id === clientId);

  if (!hasClient) {
    res.statusCode = statusCode[404].status;
    res.statusMessage = statusCode[404].message;
    res.end("{}");
    return;
  }

  if (
    req.url.startsWith("/clientes") &&
    req.url.endsWith("transacoes") &&
    req.method === "POST"
  ) {
    return transactionRoute(req, res, clientId);
  }

  if (
    req.url.startsWith("/clientes") &&
    req.url.endsWith("extrato") &&
    req.method === "GET"
  ) {
    return receiptRoute(req, res, clientId);
  }

  res.statusCode = statusCode[404].status;
  res.statusMessage = statusCode[404].message;
  res.end("{}");
  return;
};

server.listen(9999, () => console.log("Listening on 9999"));

process.on("uncaughtException", (err) => {
  console.error("Erro não tratado no servidor:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Rejeição não tratada:", reason);
});
