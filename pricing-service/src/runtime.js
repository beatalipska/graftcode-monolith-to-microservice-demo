var PricingModule = require("../../app/src/pricing").PricingModule;

var pricing = new PricingModule(null, {
  executionLabel: "separate runtime"
});

console.log("[pricing-service] runtime started");

process.on("message", async function (message) {
  if (!message || message.type !== "request") {
    return;
  }

  console.log("[pricing-service] received " + message.method + " request");

  if (message.method !== "calculatePrice") {
    process.send({
      type: "response",
      requestId: message.requestId,
      error: "unknown method " + message.method
    });
    return;
  }

  try {
    var result = await pricing.calculatePrice(
      message.args[0],
      message.args[1],
      message.args[2]
    );

    process.send({
      type: "response",
      requestId: message.requestId,
      result: result
    });
  } catch (error) {
    process.send({
      type: "response",
      requestId: message.requestId,
      error: error.message
    });
  }
});

process.send({
  type: "ready"
});
