var seedProducts = require("./seed-products");

function roundMoney(value) {
  return Math.round(value * 100) / 100;
}

function PricingModule(products, options) {
  this.productsById = {};
  this.executionLabel = (options && options.executionLabel) || "local";

  (products || seedProducts).forEach(
    function (product) {
      this.productsById[product.id] = {
        id: product.id,
        sku: product.sku,
        name: product.name,
        price: product.price,
        currency: product.currency
      };
    }.bind(this)
  );

  console.log("[pricing] ready in " + this.executionLabel + " mode");
}

PricingModule.prototype.calculatePrice = async function calculatePrice(productId, quantity, customerType) {
  var product = this.productsById[productId];

  if (!product) {
    throw new Error("product " + productId + " was not found");
  }

  var customerDiscount = customerType === "vip" ? 10 : 0;
  var quantityDiscount = quantity >= 10 ? 5 : 0;
  var discountPercent = customerDiscount + quantityDiscount;
  var subtotal = roundMoney(product.price * quantity);
  var discountAmount = roundMoney(subtotal * (discountPercent / 100));
  var total = roundMoney(subtotal - discountAmount);

  console.log(
    "[pricing] (" +
      this.executionLabel +
      ") calculatePrice(" +
      productId +
      ", " +
      quantity +
      ", " +
      customerType +
      ") -> " +
      product.currency +
      " " +
      total
  );

  return {
    productId: product.id,
    currency: product.currency,
    unitPrice: product.price,
    quantity: quantity,
    customerType: customerType,
    customerDiscountPercent: customerDiscount,
    quantityDiscountPercent: quantityDiscount,
    discountPercent: discountPercent,
    subtotal: subtotal,
    discountAmount: discountAmount,
    total: total,
    executionLabel: this.executionLabel
  };
};

module.exports = {
  PricingModule: PricingModule
};
