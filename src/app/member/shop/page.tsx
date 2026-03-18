"use client";

import { useState } from "react";
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
} from "lucide-react";
import { useApi, apiFetch } from "@/hooks/use-api";

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

interface ProductsResponse {
  products: Product[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

interface CartResponse {
  items: Array<{ id: string; quantity: number }>;
  total: number;
}

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState<ProductCategory>("All");
  const [cartCount, setCartCount] = useState(0);

  const productsUrl = `/api/shop/products?page=1&limit=20${activeCategory !== "All" ? `&category=${activeCategory}` : ""}`;
  const { data: productsData, loading, error } = useApi<ProductsResponse>(productsUrl);
  const { data: cartData } = useApi<CartResponse>("/api/shop/cart");

  const products = productsData?.products ?? [];
  const actualCartCount = cartData?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? cartCount;

  const handleAddToCart = async (productId: string) => {
    try {
      await apiFetch("/api/shop/cart", {
        method: "POST",
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      setCartCount((c) => c + 1);
    } catch {
      // silently fail for now
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Merch Store</h1>
          <p className="text-zinc-400 mt-1">Gear up with official Forge Fitness merchandise.</p>
        </div>
        <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 relative">
          <ShoppingCart className="h-5 w-5" />
          {actualCartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {actualCartCount}
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
    </div>
  );
}
