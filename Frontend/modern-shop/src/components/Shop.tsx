import React, { useEffect, useState } from "react";
import { ShoppingBag, Package, Search, X, Heart, Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import "./Shop.css";

interface Product {
  id: number;
  name: string;
  price: number;
  image?: string;
  variants?: string;
  inStock: boolean;
  category: string;
  description?: string;
}

interface CartItem extends Product {
  quantity: number;
  selectedVariant?: string;
}

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [addingProduct, setAddingProduct] = useState<number | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<Record<number, string>>({});
  const [cart, setCart] = useState<CartItem[]>([]);
  
  const categories = ["Apparel", "Footwear", "Tech", "Home", "Garden"];

  useEffect(() => {
    setLoading(true);
    setError(null);
    const url = selectedCategory
      ? `http://localhost:3000/products?category=${selectedCategory}`
      : "http://localhost:3000/products";

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Échec du chargement");
        return res.json();
      })
      .then((data) => {
        setProducts(data);
        const initialVariants: Record<number, string> = {};
        data.forEach((product: Product) => {
          if (product.variants) {
            const variantList = JSON.parse(product.variants);
            if (variantList.length > 0) {
              initialVariants[product.id] = variantList[0];
            }
          }
        });
        setSelectedVariants(initialVariants);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Impossible de charger les produits. Vérifiez votre API.");
        setProducts([]);
        setLoading(false);
      });
  }, [selectedCategory]);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFavorite = (productId: number) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  const addToCart = (product: Product, variant?: string) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.id === product.id && item.selectedVariant === variant
      );

      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id && item.selectedVariant === variant
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prevCart, { ...product, quantity: 1, selectedVariant: variant }];
    });
  };

  const removeFromCart = (productId: number, variant?: string) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === productId && item.selectedVariant === variant
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => setCart([]);
  const getTotalItems = () => cart.reduce((sum, item) => sum + item.quantity, 0);
  const getTotalPrice = () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleAddToCart = (product: Product) => {
    setAddingProduct(product.id);
    setTimeout(() => {
      addToCart(product, selectedVariants[product.id]);
      setAddingProduct(null);
    }, 600);
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-container">
          <div className="header-content">
            <div className="logo-section">
              <div className="logo-icon">
                <ShoppingBag size={24} />
              </div>
              <div className="logo-text">
                <h1>OnlineStore</h1>
                <p>Your online store</p>
              </div>
            </div>

            <div className="search-wrapper">
              <div className="search-container">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button className="search-clear" onClick={() => setSearchTerm("")}>
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            <button className="cart-button" onClick={() => setIsCartOpen(true)}>
              <ShoppingCart size={20} />
              Cart
              {getTotalItems() > 0 && (
                <span className="cart-badge">{getTotalItems()}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/*my main contentt  */}
      <main className="main-content">
        {error && (
          <div className="error-message">
            <div className="error-icon">
              <X size={20} />
            </div>
            <div>
              <div className="error-title">Error</div>
              <div className="error-text">{error}</div>
            </div>
          </div>
        )}

        <div className="categories-section">
          <span className="categories-label">Categories:</span>
          <div className="categories-buttons">
            <button
              className={`category-btn ${selectedCategory === null ? 'active' : ''}`}
              onClick={() => setSelectedCategory(null)}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner" />
            <div className="loading-text">Loading products...</div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Package size={48} />
            </div>
            <div className="empty-title">No products found</div>
            <div className="empty-text">Try another search or category</div>
          </div>
        ) : (
          <>
            <div className="products-count">
              <span className="count-number">{filteredProducts.length}</span> products found
            </div>
            <div className="products-grid">
              {filteredProducts.map((product) => {
                const variants = product.variants ? JSON.parse(product.variants) : [];
                const isAdding = addingProduct === product.id;
                
                return (
                  <div key={product.id} className="product-card">
                    <div className="product-image-container">
                      <div className="product-badge">{product.category}</div>
                      {!product.inStock && (
                        <div className="product-badge-stock">Out of stock</div>
                      )}
                      {product.inStock && (
                        <div className="product-actions">
                          <button
                            className={`action-btn ${favorites.has(product.id) ? 'favorite' : ''}`}
                            onClick={() => toggleFavorite(product.id)}
                          >
                            <Heart size={18} fill={favorites.has(product.id) ? "currentColor" : "none"} />
                          </button>
                        </div>
                      )}
                      <img
                        src={product.image || "https://via.placeholder.com/300"}
                        alt={product.name}
                        className="product-image"
                      />
                    </div>
                    
                    <div className="product-info">
                      <div className="product-name">{product.name}</div>
                      {product.description && (
                        <div className="product-description">{product.description}</div>
                      )}
                      
                      <div className="product-price-row">
                        <div className="product-price">${product.price}</div>
                        {product.inStock && (
                          <div className="stock-badge">
                            <div className="stock-dot" />
                            <span>In stock</span>
                          </div>
                        )}
                      </div>

                      {variants.length > 0 && product.inStock && (
                        <select
                          className="variant-select"
                          value={selectedVariants[product.id] || variants[0]}
                          onChange={(e) =>
                            setSelectedVariants({ ...selectedVariants, [product.id]: e.target.value })
                          }
                        >
                          {variants.map((variant: string) => (
                            <option key={variant} value={variant}>
                              {variant}
                            </option>
                          ))}
                        </select>
                      )}

                      <button
                        className={`add-to-cart-btn ${!product.inStock ? 'disabled' : ''} ${isAdding ? 'adding' : ''}`}
                        onClick={() => product.inStock && handleAddToCart(product)}
                        disabled={!product.inStock}
                      >
                        {isAdding ? (
                          <>
                            <div className="btn-spinner" />
                            Added!
                          </>
                        ) : (
                          <>
                            <ShoppingCart size={18} />
                            {product.inStock ? 'Add to cart' : 'Unavailable'}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      {/* the cart */}
      <div
        className={`cart-overlay ${isCartOpen ? 'active' : ''}`}
        onClick={() => setIsCartOpen(false)}
      />

   
      <div className={`cart-sidebar ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <div className="cart-header-content">
            <div className="cart-icon-wrapper">
              <ShoppingCart size={24} />
            </div>
            <div>
              <h2>Cart</h2>
              <p>{getTotalItems()} article{getTotalItems() !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button className="cart-close" onClick={() => setIsCartOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">
                <ShoppingCart size={48} />
              </div>
              <div className="cart-empty-title">Your cart is empty</div>
              <div className="cart-empty-text">Add products to get started</div>
            </div>
          ) : (
            cart.map((item) => (
              <div key={`${item.id}-${item.selectedVariant}`} className="cart-item">
                <div className="cart-item-image-wrapper">
                  <img
                    src={item.image || "https://via.placeholder.com/80"}
                    alt={item.name}
                    className="cart-item-image"
                  />
                  <div className="cart-item-quantity-badge">{item.quantity}</div>
                </div>
                
                <div className="cart-item-details">
                  <div className="cart-item-name">{item.name}</div>
                  {item.selectedVariant && (
                    <span className="cart-item-variant">{item.selectedVariant}</span>
                  )}
                  
                  <div className="cart-item-footer">
                    <div className="cart-item-price">${(item.price * item.quantity).toFixed(2)}</div>
                    
                    <div className="cart-item-controls">
                      <button
                        className="cart-control-btn minus"
                        onClick={() => removeFromCart(item.id, item.selectedVariant)}
                      >
                        <Minus size={16} />
                      </button>
                      <div className="cart-control-quantity">{item.quantity}</div>
                      <button
                        className="cart-control-btn plus"
                        onClick={() => addToCart(item, item.selectedVariant)}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Total</span>
              <div className="cart-total-price">${getTotalPrice().toFixed(2)}</div>
            </div>

            <div className="cart-actions">
              <button className="clear-cart-btn" onClick={clearCart}>
                <Trash2 size={18} />
                Empty the cart
              </button>

              <button className="checkout-btn">
                Proceed to checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}