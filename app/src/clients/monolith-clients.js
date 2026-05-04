var CatalogModule = require("../catalog").CatalogModule;
var PricingModule = require("../pricing").PricingModule;
var OrdersModule = require("../orders").OrdersModule;
var createGraftPricingClient = require("./graft-pricing-client").createGraftPricingClient;

function tryCreateLocalGraftPricingClient() {
  try {
    var pricing = createGraftPricingClient();
    console.log("[app] generated Graft detected -> using host=inMemory");
    return pricing;
  } catch (error) {
    console.log("[app] generated Graft not available -> falling back to direct module");
    return null;
  }
}

async function createMonolithApp() {
  console.log("[app] PRICING_MODE=local -> wiring pricing as local module");

  var catalog = new CatalogModule(null, {
    executionLabel: "monolith process"
  });
  var pricing =
    tryCreateLocalGraftPricingClient() ||
    new PricingModule(null, {
      executionLabel: "monolith process"
    });
  var orders = new OrdersModule(catalog, pricing, {
    executionLabel: "monolith process"
  });

  return {
    catalog: catalog,
    pricing: pricing,
    orders: orders,
    close: async function close() {}
  };
}

module.exports = {
  createMonolithApp: createMonolithApp
};
