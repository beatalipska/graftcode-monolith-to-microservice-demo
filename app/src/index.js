var createMonolithApp = require("./clients/monolith-clients").createMonolithApp;
var createDistributedApp = require("./clients/distributed-clients").createDistributedApp;

function getPricingMode() {
  var value = (process.env.PRICING_MODE || "local").toLowerCase();

  if (value !== "local" && value !== "remote") {
    throw new Error('PRICING_MODE must be "local" or "remote"');
  }

  return value;
}

function printOrderSummary(order) {
  console.log("- order: " + order.orderNumber);
  console.log("  product: " + order.sku + " | " + order.productName);
  console.log("  quantity: " + order.quantity + " | customer: " + order.customerType);
  console.log("  subtotal: " + order.currency + " " + order.subtotal);
  console.log("  discount: " + order.discountPercent + "% (" + order.currency + " " + order.discountAmount + ")");
  console.log("  total: " + order.currency + " " + order.total);
  console.log("  pricing execution: " + order.pricingExecutionLabel);
}

async function runScenario(mode, createApp) {
  var app = await createApp();

  try {
    console.log("");
    console.log("Mode: " + mode);
    console.log("=".repeat(("Mode: " + mode).length));

    var products = await app.catalog.listProducts();

    console.log("Products available:");
    products.forEach(function (product) {
      console.log("- " + product.id + " | " + product.sku + " | " + product.currency + " " + product.price);
    });

    console.log("");
    console.log("Creating orders...");
    var regularOrder = await app.orders.createOrder("prod_2001", 2, "regular");
    var vipBulkOrder = await app.orders.createOrder("prod_2002", 12, "vip");

    console.log("");
    console.log("Order summaries");
    console.log("---------------");
    printOrderSummary(regularOrder);
    printOrderSummary(vipBulkOrder);

    console.log("");
    console.log("What stayed the same");
    console.log("--------------------");
    console.log("- orders.createOrder(...) used the same order flow");
    console.log("- catalog and pricing were still called through typed method calls");
    console.log("- only the dependency wiring changed");
  } finally {
    await app.close();
  }
}

async function main() {
  var pricingMode = getPricingMode();
  var modeLabel = pricingMode === "local" ? "monolith" : "distributed";
  var createApp = pricingMode === "local" ? createMonolithApp : createDistributedApp;

  console.log("");
  console.log("Graftcode architecture evolution exploration");
  console.log("============================================");
  console.log("We are testing whether pricing can move across a deployment boundary");
  console.log("without rewriting the order business flow.");
  console.log("Current switch: PRICING_MODE=" + pricingMode);

  await runScenario(modeLabel, createApp);

  console.log("");
  console.log("Open question for the real system");
  console.log("---------------------------------");
  console.log("This small run keeps the order flow stable while pricing moves in or out.");
  console.log("The next things worth testing are auth, retries, tracing, and client update workflow.");
}

main().catch(function (error) {
  console.error("[app] failed:", error.message);
  process.exit(1);
});
