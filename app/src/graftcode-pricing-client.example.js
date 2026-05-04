/**
 * This file shows the intended Graftcode swap point for distributed mode.
 *
 * In the real Graft path used by this demo, distributed mode imports the
 * generated pricing Graft here and sets GRAFT_CONFIG before any calls.
 *
 * Example shape:
 *
 *   var generatedGraft = require("@graft/npm-architecture-evolution-pricing");
 *   var GraftConfig = generatedGraft.GraftConfig;
 *   var PricingService = generatedGraft.PricingService;
 *
 *   GraftConfig.setConfig(process.env.GRAFT_CONFIG);
 *
 *   module.exports = {
 *     pricing: {
 *       calculatePrice: function (productId, quantity, customerType) {
 *         return PricingService.calculatePrice(productId, quantity, customerType);
 *       }
 *     }
 *   };
 *
 * The interesting part is that orders.createOrder(...) should not care whether
 * pricing is local or runs across a deployment boundary.
 */
