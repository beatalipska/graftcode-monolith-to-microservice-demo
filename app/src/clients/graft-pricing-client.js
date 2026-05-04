function getRemoteHost() {
  return process.env.PRICING_REMOTE_HOST || "ws://localhost:19090/ws";
}

function getGraftConfig() {
  var host = process.env.PRICING_MODE === "local" ? "inMemory" : getRemoteHost();

  return (
    "name=@graft/npm-architecture-evolution-pricing;" +
    "modules=./modules;" +
    "runtime=nodejs;" +
    "host=" +
    host
  );
}

function loadGeneratedGraft() {
  try {
    return require("@graft/npm-architecture-evolution-pricing");
  } catch (error) {
    var message = [
      "remote pricing mode now expects the generated Graft package.",
      'Run "./scripts/setup-remote-pricing.sh" inside architecture-evolution first.',
      "If that still fails with ETARGET, we are likely hitting the current alpha registry issue we saw in this repo.",
      "You can still inspect the architecture shape with ALLOW_REMOTE_STANDIN=1."
    ].join(" ");

    error.message = message + " Original error: " + error.message;
    throw error;
  }
}

function createGraftPricingClient() {
  var generatedGraft = loadGeneratedGraft();
  var GraftConfig = generatedGraft.GraftConfig;
  var PricingService = generatedGraft.PricingService;
  var config = process.env.GRAFT_CONFIG || getGraftConfig();

  if (!GraftConfig || !PricingService) {
    throw new Error(
      "The generated pricing graft did not expose GraftConfig and PricingService as expected."
    );
  }

  GraftConfig.setConfig(config);

  return {
    calculatePrice: function calculatePrice(productId, quantity, customerType) {
      var destination = config.indexOf("host=inMemory") >= 0 ? "in-process via Graft" : "remote runtime via Graft";
      console.log(`[pricing-graft] calculatePrice(${productId}, ${quantity}, ${customerType}) -> ${destination}`);

      return PricingService.calculatePrice(productId, quantity, customerType);
    },
    getExecutionLabel: function getExecutionLabel() {
      return config.indexOf("host=inMemory") >= 0
        ? "generated Graft (inMemory)"
        : "generated Graft (remote runtime)";
    }
  };
}

module.exports = {
  createGraftPricingClient: createGraftPricingClient,
  getGraftConfig: getGraftConfig
};
