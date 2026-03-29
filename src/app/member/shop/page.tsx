"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  ShoppingBag,
  Star,
  Image as ImageIcon,
  Loader2,
  X,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  CreditCard,
} from "lucide-react";
import { useApi, apiFetch } from "@/hooks/use-api";
import { toast } from "sonner";

type ProductCategory = "All" | "Apparel" | "Supplements" | "Accessories" | "Equipment" | "Digital";

const CATEGORIES: ProductCategory[] = ["All", "Apparel", "Supplements", "Accessories", "Equipment", "Digital"];

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  images: string[];
  stock: number;
}

interface CartItem {
  id: string;
  quantity: number;
  product: Product;
}

interface ProductsResponse {
  products: Product[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

interface CartResponse {
  items: CartItem[];
  total: number;
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 text-orange-500 animate-spin" /></div>}>
      <ShopContent />
    </Suspense>
  );
}

function ShopContent() {
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<ProductCategory>("All");
  const [cartOpen, setCartOpen] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const productsUrl = `/api/shop/products?page=1&limit=20${activeCategory !== "All" ? `&category=${activeCategory}` : ""}`;
  const { data: productsData, loading, error } = useApi<ProductsResponse>(productsUrl);
  const { data: cartData, refetch: refetchCart } = useApi<CartResponse>("/api/shop/cart");

  const products = productsData?.products ?? [];
  const cartItems = cartData?.items ?? [];
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Check for success redirect from Stripe
  useEffect(() => {
    if (searchParams.get("status") === "success") {
      setOrderSuccess(true);
      refetchCart();
    }
  }, [searchParams]);

  const handleAddToCart = async (productId: string) => {
    try {
      await apiFetch("/api/shop/cart", {
        method: "POST",
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      refetchCart();
    } catch {
      // silently fail for now
    }
  };

  const handleUpdateQuantity = async (cartItemId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        await apiFetch(`/api/shop/cart/${cartItemId}`, { method: "DELETE" });
      } else {
        await apiFetch(`/api/shop/cart/${cartItemId}`, {
          method: "PUT",
          body: JSON.stringify({ quantity }),
        });
      }
      refetchCart();
    } catch {
      // silently fail
    }
  };

  const handleRemoveItem = async (cartItemId: string) => {
    try {
      await apiFetch(`/api/shop/cart/${cartItemId}`, { method: "DELETE" });
      refetchCart();
    } catch {
      // silently fail
    }
  };

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      const res = await apiFetch<{ url: string }>("/api/payments/checkout", {
        method: "POST",
        body: JSON.stringify({}),
      });
      if (res.url) {
        window.location.href = res.url;
      }
    } catch (err: any) {
      toast.error(err.message || "Checkout failed. Please try again.");
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Order Success Banner */}
      {orderSuccess && (
        <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
          <div className="flex-1">
            <p className="text-green-400 font-medium">Order placed successfully!</p>
            <p className="text-green-400/70 text-sm">Check your email for confirmation.</p>
          </div>
          <button onClick={() => setOrderSuccess(false)} className="text-green-400/50 hover:text-green-400">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Merch Store</h1>
          <p className="text-zinc-400 mt-1">Gear up with official Gymtality merchandise.</p>
        </div>
        <Button
          variant="outline"
          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 relative"
          onClick={() => setCartOpen(true)}
        >
          <ShoppingCart className="h-5 w-5" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Button>
      </div>

      {/* Category Chips */}
      <div className="flex items-center gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              activeCategory === cat
                ? "bg-orange-500 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-400">Failed to load products. Please try again.</p>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && products.length === 0 && (
        <div className="text-center py-12">
          <ShoppingBag className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-400">No products found in this category.</p>
        </div>
      )}

      {/* Product Grid */}
      {!loading && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <Card key={product.id} className="bg-zinc-900 border-zinc-800 hover:border-orange-500/50 transition group">
              <CardContent className="pt-4 space-y-3">
                {/* Image Placeholder */}
                <div className="relative h-48 bg-zinc-800 rounded-lg flex items-center justify-center">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <ImageIcon className="h-12 w-12 text-zinc-600" />
                  )}
                  {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-semibold text-zinc-300">Sold Out</span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-white text-sm leading-tight">
                      {product.name}
                    </h3>
                    {product.category && (
                      <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700 shrink-0">
                        {product.category}
                      </Badge>
                    )}
                  </div>
                  {product.description && (
                    <p className="text-xs text-zinc-400 line-clamp-2">{product.description}</p>
                  )}
                </div>

                {/* Price */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                    <span className="text-sm text-zinc-300">--</span>
                  </div>
                  <span className="text-lg font-bold text-orange-500">${product.price.toFixed(2)}</span>
                </div>

                <Button
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={product.stock <= 0}
                  onClick={() => handleAddToCart(product.id)}
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60" onClick={() => setCartOpen(false)} />

          {/* Drawer */}
          <div className="relative w-full max-w-md bg-zinc-900 border-l border-zinc-800 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-orange-500" />
                Cart ({cartCount})
              </h2>
              <button onClick={() => setCartOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cartItems.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="h-10 w-10 text-zinc-700 mx-auto mb-2" />
                  <p className="text-zinc-500 text-sm">Your cart is empty</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg">
                    <div className="w-14 h-14 bg-zinc-700 rounded-lg flex items-center justify-center shrink-0">
                      {item.product.images?.[0] ? (
                        <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-zinc-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{item.product.name}</p>
                      <p className="text-sm text-orange-500 font-semibold">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="p-1 rounded bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-sm text-white w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="p-1 rounded bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1 text-zinc-500 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="p-4 border-t border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Subtotal</span>
                  <span className="text-lg font-bold text-white">${cartTotal.toFixed(2)}</span>
                </div>
                <Button
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  disabled={checkingOut}
                  onClick={handleCheckout}
                >
                  {checkingOut ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CreditCard className="h-4 w-4 mr-2" />
                  )}
                  {checkingOut ? "Redirecting to Stripe..." : "Checkout"}
                </Button>
                <p className="text-xs text-zinc-500 text-center">
                  Secure payment powered by Stripe
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
