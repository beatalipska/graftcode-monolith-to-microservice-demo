var CatalogModule = require("./app-src/catalog").CatalogModule;
var PricingModule = require("./app-src/pricing").PricingModule;
var OrdersModule = require("./app-src/orders").OrdersModule;

var catalog = new CatalogModule(null, {
  executionLabel: "monolith gateway runtime"
});
var pricing = new PricingModule(null, {
  executionLabel: "monolith gateway runtime"
});
var orders = new OrdersModule(catalog, pricing, {
  executionLabel: "monolith gateway runtime"
});

class CatalogService {
  static getProduct(id) {
    return catalog.getProduct(id);
  }

  static listProducts() {
    return catalog.listProducts();
  }
}

class PricingService {
  static calculatePrice(productId, quantity, customerType) {
    return pricing.calculatePrice(productId, quantity, customerType);
  }
}

class OrdersService {
  static createOrder(productId, quantity, customerType) {
    return orders.createOrder(productId, quantity, customerType);
  }
}

module.exports = {
  CatalogService: CatalogService,
  PricingService: PricingService,
  OrdersService: OrdersService
};
