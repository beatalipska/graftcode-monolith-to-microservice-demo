var path = require("path");
var fork = require("child_process").fork;
var CatalogModule = require("../catalog").CatalogModule;
var OrdersModule = require("../orders").OrdersModule;

function DistributedPricingClient(childProcess) {
  this.childProcess = childProcess;
  this.pending = {};
  this.nextRequestId = 1;

  childProcess.on(
    "message",
    function (message) {
      if (!message || !message.type) {
        return;
      }

      if (message.type === "response" && this.pending[message.requestId]) {
        var pending = this.pending[message.requestId];
        delete this.pending[message.requestId];

        if (message.error) {
          pending.reject(new Error(message.error));
          return;
        }

        pending.resolve(message.result);
      }
    }.bind(this)
  );

  childProcess.on(
    "exit",
    function (code) {
      Object.keys(this.pending).forEach(
        function (requestId) {
          this.pending[requestId].reject(
            new Error("pricing runtime exited before responding (code " + code + ")")
          );
          delete this.pending[requestId];
        }.bind(this)
      );
    }.bind(this)
  );
}

DistributedPricingClient.prototype.calculatePrice = function calculatePrice(productId, quantity, customerType) {
  var requestId = this.nextRequestId++;

  console.log(`[pricing-graft-standin] calculatePrice(${productId}, ${quantity}, ${customerType}) -> separate runtime`);

  return new Promise(
    function (resolve, reject) {
      this.pending[requestId] = {
        resolve: resolve,
        reject: reject
      };

      this.childProcess.send({
        type: "request",
        requestId: requestId,
        method: "calculatePrice",
        args: [productId, quantity, customerType]
      });
    }.bind(this)
  );
};

function waitForReady(childProcess) {
  return new Promise(function (resolve, reject) {
    var timeout = setTimeout(function () {
      reject(new Error("timed out waiting for pricing runtime"));
    }, 5000);

    childProcess.on("message", function onMessage(message) {
      if (message && message.type === "ready") {
        clearTimeout(timeout);
        resolve();
      }
    });

    childProcess.on("exit", function (code) {
      clearTimeout(timeout);
      reject(new Error("pricing runtime exited before ready (code " + code + ")"));
    });
  });
}

async function createStandinDistributedApp() {
  console.log("[app] using explicit remote stand-in because ALLOW_REMOTE_STANDIN=1");

  var childProcess = fork(path.join(__dirname, "../../../pricing-service/src/runtime.js"), [], {
    stdio: ["inherit", "inherit", "inherit", "ipc"]
  });

  await waitForReady(childProcess);

  var catalog = new CatalogModule(null, {
    executionLabel: "app process"
  });
  var pricing = new DistributedPricingClient(childProcess);
  var orders = new OrdersModule(catalog, pricing, {
    executionLabel: "app process"
  });

  return {
    catalog: catalog,
    pricing: pricing,
    orders: orders,
    close: async function close() {
      childProcess.kill();
    }
  };
}

module.exports = {
  createStandinDistributedApp: createStandinDistributedApp
};
