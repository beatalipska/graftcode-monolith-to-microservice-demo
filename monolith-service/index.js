var CatalogModule = require("./app-src/catalog").CatalogModule;
var PricingModule = require("./app-src/pricing").PricingModule;
var OrdersModule = require("./app-src/orders").OrdersModule;

class CatalogService {
  /** @param {string} id */
  static getProduct(id) {
    if (!CatalogService.moduleInstance) {
      CatalogService.moduleInstance = new CatalogModule(null, { executionLabel: "monolith gateway runtime" });
    }
    return CatalogService.moduleInstance.getProduct(id);
  }

  static listProducts() {
    if (!CatalogService.moduleInstance) {
      CatalogService.moduleInstance = new CatalogModule(null, { executionLabel: "monolith gateway runtime" });
    }
    return CatalogService.moduleInstance.listProducts();
  }
}

class PricingService {
  /**
   * @param {string} productId
   * @param {number} quantity
   * @param {string} customerType
   */
  static calculatePrice(productId, quantity, customerType) {
    if (!PricingService.moduleInstance) {
      PricingService.moduleInstance = new PricingModule(null, { executionLabel: "monolith gateway runtime" });
    }
    return PricingService.moduleInstance.calculatePrice(productId, quantity, customerType);
  }
}

class OrdersService {
  /**
   * @param {string} productId
   * @param {number} quantity
   * @param {string} customerType
   */
  static createOrder(productId, quantity, customerType) {
    if (!OrdersService.moduleInstance) {
      if (!CatalogService.moduleInstance) {
        CatalogService.moduleInstance = new CatalogModule(null, { executionLabel: "monolith gateway runtime" });
      }
      if (!PricingService.moduleInstance) {
        PricingService.moduleInstance = new PricingModule(null, { executionLabel: "monolith gateway runtime" });
      }
      OrdersService.moduleInstance = new OrdersModule(
        CatalogService.moduleInstance,
        PricingService.moduleInstance,
        { executionLabel: "monolith gateway runtime" }
      );
    }
    return OrdersService.moduleInstance.createOrder(productId, quantity, customerType);
  }
}

module.exports = {
  CatalogService: CatalogService,
  PricingService: PricingService,
  OrdersService: OrdersService
};
