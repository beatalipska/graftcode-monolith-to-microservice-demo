var PricingModule = require("./app-src/pricing").PricingModule;

class PricingService {
  /**
   * @param {string} productId
   * @param {number} quantity
   * @param {string} customerType
   */
  static calculatePrice(productId, quantity, customerType) {
    if (!PricingService.moduleInstance) {
      PricingService.moduleInstance = new PricingModule(null, {
        executionLabel: "graftcode gateway runtime"
      });
    }

    return PricingService.moduleInstance.calculatePrice(productId, quantity, customerType).then(function (result) {
      console.log("[PricingService] result:\n" + JSON.stringify(result, null, 2));
      return result;
    });
  }
}

module.exports = {
  PricingService: PricingService
};
