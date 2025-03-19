import { describe, before, after, it } from "node:test";
import { deepEqual, deepStrictEqual } from "node:assert";

async function makeRequest(url, data) {
  const { method, requestBody } = data;
  const request = await fetch(url, {
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
    body: method === "POST" ? JSON.stringify(requestBody) : null,
  });

  const response = await request.json();
  return {
    response,
    statusCode: request.status,
    statusMessage: request.statusText,
  };
}

const transaction = {
  valor: 1000,
  tipo: "c",
  descricao: "credito",
};

describe("API Test Suite", () => {
  let _server = {};
  const url = "http://localhost:9999";

  // Inicia a API - Roda antes dos testes
  before(async () => {
    _server = (await import("../../server.js")).server;

    await new Promise((resolve, reject) => {
      _server.once("listening", resolve);
    });
  });

  // Testes de endpoint

  it("should GET client bank account information and return http status 200 OK", async () => {
    const { response, statusCode, statusMessage } = await makeRequest(
      `${url}/clientes/5/extrato`,
      { method: "GET" }
    );
    deepStrictEqual(statusCode, 200);
    deepStrictEqual(statusMessage, "OK");
  });

  it("should POST transaction and return http status 200 OK", async () => {
    const { response, statusCode, statusMessage } = await makeRequest(
      `${url}/clientes/5/transacoes`,
      {
        method: "POST",
        requestBody: transaction,
      }
    );

    const expectedResponse = {
      limite: 500000,
      saldo: 1000,
    };

    deepStrictEqual(statusCode, 200);
    deepStrictEqual(statusMessage, "OK");
    deepStrictEqual(response, expectedResponse);
  });

  it("should return http status 404 Not Found because route doesn't exists", async () => {
    const { statusCode, statusMessage } = await makeRequest(
      `${url}/cliente/4/transacoes`,
      {
        method: "POST",
        requestBody: {
          ...transaction,
          valor: 60,
          tipo: "c",
        },
      }
    );

    deepStrictEqual(statusCode, 404);
    deepStrictEqual(statusMessage, "Not Found");
  });

  it("should return http status 404 Not Found because of invalid id", async () => {
    const { statusCode, statusMessage } = await makeRequest(
      `${url}/clientes/6/extrato`,
      { method: "GET" }
    );
    deepStrictEqual(statusCode, 404);
    deepStrictEqual(statusMessage, "Not Found");
  });

  it("should return http status 404 Not Found because of invalid id", async () => {
    const { statusCode, statusMessage } = await makeRequest(
      `${url}/clientes/6/transacoes`,
      {
        method: "POST",
        requestBody: transaction,
      }
    );
    deepStrictEqual(statusCode, 404);
    deepStrictEqual(statusMessage, "Not Found");
  });

  it("should return http status 422 Unprocessable Entity because of inconsistent balance", async () => {
    const { statusCode, statusMessage } = await makeRequest(
      `${url}/clientes/5/transacoes`,
      {
        method: "POST",
        requestBody: {
          ...transaction,
          valor: 600000,
          tipo: "d",
        },
      }
    );
    deepStrictEqual(statusCode, 422);
    deepStrictEqual(statusMessage, "Unprocessable Entity");
  });

  it("should return http status 422 Unprocessable Entity because of invalid payload", async () => {
    const { statusCode, statusMessage } = await makeRequest(
      `${url}/clientes/4/transacoes`,
      {
        method: "POST",
        requestBody: {
          ...transaction,
          valor: 6000,
          tipo: "e",
        },
      }
    );
    deepStrictEqual(statusCode, 422);
    deepStrictEqual(statusMessage, "Unprocessable Entity");
  });

  it("should return http status 422 Unprocessable Entity because of value property is not a integer", async () => {
    const { statusCode, statusMessage } = await makeRequest(
      `${url}/clientes/4/transacoes`,
      {
        method: "POST",
        requestBody: {
          ...transaction,
          valor: 60.75,
          tipo: "c",
        },
      }
    );
    deepStrictEqual(statusCode, 422);
    deepStrictEqual(statusMessage, "Unprocessable Entity");
  });

  // Desliga a API - Roda depois dos testes
  after((done) => _server.close(done));
});
