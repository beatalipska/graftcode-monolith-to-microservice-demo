var CatalogModule = require("../catalog").CatalogModule;
var OrdersModule = require("../orders").OrdersModule;
var createGraftPricingClient = require("./graft-pricing-client").createGraftPricingClient;
var getGraftConfig = require("./graft-pricing-client").getGraftConfig;
var createStandinDistributedApp = require("./remote-pricing-standin").createStandinDistributedApp;

async function createDistributedApp() {
  console.log("[app] PRICING_MODE=remote -> wiring pricing as remote Graft client");
  console.log(`[app] GRAFT_CONFIG: ${process.env.GRAFT_CONFIG || getGraftConfig()}`);

  if (process.env.ALLOW_REMOTE_STANDIN === "1") {
    return createStandinDistributedApp();
  }

  var catalog = new CatalogModule(null, {
    executionLabel: "app process"
  });
  var pricing = createGraftPricingClient();
  var orders = new OrdersModule(catalog, pricing, {
    executionLabel: "app process"
  });

  return {
    catalog: catalog,
    pricing: pricing,
    orders: orders,
    close: async function close() {}
  };
}

module.exports = {
  createDistributedApp: createDistributedApp
};
