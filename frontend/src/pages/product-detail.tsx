import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Star, Check, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";

export default function ProductDetail() {
  const params = useParams();
  const productId = parseInt(params.id!);
  const [quantity, setQuantity] = useState(1);
  const { addToCart, isAddingToCart } = useCart();
  const { toast } = useToast();

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ['/api/products', productId],
  });

  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart({ productId: product.id, quantity }, {
      onSuccess: () => {
        toast({
          title: "Added to cart",
          description: `${quantity} x ${product.name} added to your cart.`,
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to add item to cart. Please try again.",
          variant: "destructive",
        });
      },
    });
  };

  const handleBuyNow = () => {
    if (!product) return;
    
    addToCart({ productId: product.id, quantity }, {
      onSuccess: () => {
        // Navigate to checkout after adding to cart
        window.location.href = '/checkout';
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to add item to cart. Please try again.",
          variant: "destructive",
        });
      },
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <Skeleton className="w-full h-96 rounded-lg" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="w-full h-32 rounded-lg" />
              <Skeleton className="w-full h-32 rounded-lg" />
            </div>
          </div>
          <div className="space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-10 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
          <Link href="/products">
            <Button>Back to Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-6">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-96 object-cover rounded-lg"
          />
          <div className="grid grid-cols-2 gap-4">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-32 object-cover rounded-lg cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
            />
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-32 object-cover rounded-lg cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <Badge className="mb-4 bg-accent text-white">
              {product.category}
            </Badge>
            <h1 className="text-3xl font-bold font-poppins mb-2">{product.name}</h1>
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                {renderStars(product.rating)}
              </div>
              <span className="ml-2 text-gray-600">({product.rating} rating)</span>
            </div>
            <p className="text-3xl font-bold text-primary mb-6">
              ₹{product.price.toFixed(0)}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Description</h3>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <span className="font-medium">Quantity:</span>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="px-4 py-2 border-x border-gray-300 min-w-12 text-center">
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className="flex-1 bg-primary hover:bg-blue-700 text-white"
              >
                {isAddingToCart ? "Adding..." : "Add to Cart"}
              </Button>
              <Button
                onClick={handleBuyNow}
                disabled={isAddingToCart}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              >
                Buy Now
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-3">Product Features</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  High quality materials
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  Free shipping
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  30-day return policy
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  1-year warranty
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
