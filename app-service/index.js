var CatalogModule = require("./app-src/catalog").CatalogModule;
var OrdersModule = require("./app-src/orders").OrdersModule;
var createGraftPricingClient = require("./app-src/clients/graft-pricing-client").createGraftPricingClient;

var catalog = new CatalogModule(null, {
  executionLabel: "app gateway runtime"
});
var pricingClient = null;
var orders = null;

function getOrders() {
  if (!pricingClient) {
    pricingClient = createGraftPricingClient();
  }

  if (!orders) {
    orders = new OrdersModule(catalog, pricingClient, {
      executionLabel: "app gateway runtime"
    });
  }

  return orders;
}

class CatalogService {
  /** @param {string} id */
  static getProduct(id) {
    return catalog.getProduct(id);
  }

  static listProducts() {
    return catalog.listProducts();
  }
}

class OrdersService {
  /**
   * @param {string} productId
   * @param {number} quantity
   * @param {string} customerType
   */
  static createOrder(productId, quantity, customerType) {
    return getOrders().createOrder(productId, quantity, customerType);
  }
}

module.exports = {
  CatalogService: CatalogService,
  OrdersService: OrdersService
};
