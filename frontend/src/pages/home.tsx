import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProductCard } from "@/components/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@shared/schema";
import { Link } from "wouter";

export default function Home() {
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const featuredProducts = products.slice(0, 4);

  const categories = [
    {
      name: "Mattress",
      value: "mattress",
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      description: "Premium quality mattresses for better sleep"
    },
    {
      name: "Pillow",
      value: "pillow",
      image: "https://images.unsplash.com/photo-1584434128309-6d96d6818202?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      description: "Comfortable pillows for perfect rest"
    },
    {
      name: "Home & Living",
      value: "home",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      description: "Beautiful home decor and furniture"
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <div className="relative gradient-hero text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h2 className="text-5xl font-bold font-poppins mb-6">
              Discover Amazing Products
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Shop the latest trends with free shipping and easy returns
            </p>
            <Link href="/products">
              <Button 
                size="lg" 
                className="bg-accent hover:bg-amber-600 text-white font-semibold transform hover:scale-105 transition-all"
              >
                Shop Now
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h3 className="text-3xl font-bold font-poppins text-center mb-12">
          Shop by Category
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Card key={category.value} className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-48 object-cover"
              />
              <CardContent className="p-6">
                <h4 className="text-xl font-semibold mb-2">{category.name}</h4>
                <p className="text-gray-600 mb-4">{category.description}</p>
                <Link href={`/products?category=${category.value}`}>
                  <Button variant="ghost" className="text-primary hover:text-secondary font-medium p-0">
                    Explore →
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white">
        <h3 className="text-3xl font-bold font-poppins text-center mb-12">
          Featured Products
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {isLoading
            ? Array(4).fill(0).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="w-full h-48" />
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))
            : featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
        </div>
      </div>
    </div>
  );
}
