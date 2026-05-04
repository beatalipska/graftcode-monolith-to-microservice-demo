var PricingModule = require("./app-src/pricing").PricingModule;

class PricingService {
  static calculatePrice(productId, quantity, customerType) {
    if (!PricingService.moduleInstance) {
      PricingService.moduleInstance = new PricingModule(null, {
        executionLabel: "graftcode gateway runtime"
      });
    }

    return PricingService.moduleInstance.calculatePrice(productId, quantity, customerType);
  }
}

module.exports = {
  PricingService: PricingService
};
