function OrdersModule(catalog, pricing, options) {
  this.catalog = catalog;
  this.pricing = pricing;
  this.executionLabel = (options && options.executionLabel) || "app";
  this.orderCounter = 1;
  console.log("[orders] ready in " + this.executionLabel + " mode");
}

OrdersModule.prototype.createOrder = async function createOrder(productId, quantity, customerType) {
  console.log(
    "[orders] (" +
      this.executionLabel +
      ") createOrder(" +
      productId +
      ", " +
      quantity +
      ", " +
      customerType +
      ")"
  );

  if (quantity <= 0) {
    throw new Error("quantity must be greater than zero");
  }

  var product = await this.catalog.getProduct(productId);

  if (!product) {
    throw new Error("product " + productId + " was not found");
  }

  // This is the key integration idea in the demo.
  // The order flow stays the same whether pricing is local or moved across a deployment boundary.
  var price = await this.pricing.calculatePrice(productId, quantity, customerType);
  var orderNumber = "ord_" + String(this.orderCounter++).padStart(4, "0");

  return {
    orderNumber: orderNumber,
    productId: product.id,
    sku: product.sku,
    productName: product.name,
    quantity: quantity,
    customerType: customerType,
    currency: price.currency,
    unitPrice: price.unitPrice,
    subtotal: price.subtotal,
    discountPercent: price.discountPercent,
    discountAmount: price.discountAmount,
    total: price.total,
    pricingExecutionLabel: price.executionLabel
  };
};

module.exports = {
  OrdersModule: OrdersModule
};
