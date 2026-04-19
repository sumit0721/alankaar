import ProductCard from "./ProductCard.jsx";

function ProductGrid({ products }) {
  if (!products.length) {
    return <p>No products available right now.</p>;
  }

  return (
    <div className="card-grid">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}

export default ProductGrid;
