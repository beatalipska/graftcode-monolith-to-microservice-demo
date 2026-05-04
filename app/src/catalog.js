var seedProducts = require("./seed-products");

function cloneProduct(product) {
  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    price: product.price,
    currency: product.currency
  };
}

function CatalogModule(products, options) {
  this.products = (products || seedProducts).map(cloneProduct);
  this.executionLabel = (options && options.executionLabel) || "local";
  console.log("[catalog] ready in " + this.executionLabel + " mode with " + this.products.length + " products");
}

CatalogModule.prototype.getProduct = async function getProduct(id) {
  var product = this.products.find(function (item) {
    return item.id === id;
  });

  console.log("[catalog] (" + this.executionLabel + ") getProduct(" + id + ")");
  return product ? cloneProduct(product) : null;
};

CatalogModule.prototype.listProducts = async function listProducts() {
  console.log("[catalog] (" + this.executionLabel + ") listProducts()");
  return this.products.map(cloneProduct);
};

module.exports = {
  CatalogModule: CatalogModule
};
