import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ProductCard } from "@/components/product-card";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { Product } from "@shared/schema";

export default function Products() {
  const [location] = useLocation();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<string>("");
  const [selectedRatings, setSelectedRatings] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("featured");
  
  const { data: allProducts = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  // Get category from URL params if present
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const categoryParam = urlParams.get('category');
    if (categoryParam && !selectedCategories.includes(categoryParam)) {
      setSelectedCategories([categoryParam]);
    }
  }, [location]);

  // Filter and sort products
  const filteredProducts = allProducts.filter((product) => {
    // Category filter
    if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) {
      return false;
    }

    // Price filter
    if (priceRange) {
      const price = product.price;
      switch (priceRange) {
        case "0-5000":
          if (price < 0 || price > 5000) return false;
          break;
        case "5000-15000":
          if (price < 5000 || price > 15000) return false;
          break;
        case "15000+":
          if (price < 15000) return false;
          break;
      }
    }

    // Rating filter
    if (selectedRatings.length > 0) {
      const rating = product.rating;
      const passesRating = selectedRatings.some(ratingFilter => {
        switch (ratingFilter) {
          case "4+":
            return rating >= 4;
          case "3+":
            return rating >= 3;
          default:
            return true;
        }
      });
      if (!passesRating) return false;
    }

    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      default:
        return 0; // featured order
    }
  });

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, category]);
    } else {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    }
  };

  const handleRatingChange = (rating: string, checked: boolean) => {
    if (checked) {
      setSelectedRatings([...selectedRatings, rating]);
    } else {
      setSelectedRatings(selectedRatings.filter(r => r !== rating));
    }
  };

  const categories = [
    { value: "mattress", label: "Mattress" },
    { value: "pillow", label: "Pillow" },
    { value: "home", label: "Home & Living" },
  ];

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setPriceRange("");
    setSelectedRatings([]);
    setSortBy("featured");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="lg:w-1/4">
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Filters</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearAllFilters}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              </div>
              
              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Category</h4>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={category.value}
                        checked={selectedCategories.includes(category.value)}
                        onCheckedChange={(checked) => handleCategoryChange(category.value, checked as boolean)}
                      />
                      <Label htmlFor={category.value} className="text-sm">
                        {category.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Price Range</h4>
                <RadioGroup value={priceRange} onValueChange={setPriceRange}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0-5000" id="price-0-5000" />
                    <Label htmlFor="price-0-5000" className="text-sm">₹0 - ₹5,000</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="5000-15000" id="price-5000-15000" />
                    <Label htmlFor="price-5000-15000" className="text-sm">₹5,000 - ₹15,000</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="15000+" id="price-15000+" />
                    <Label htmlFor="price-15000+" className="text-sm">₹15,000+</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Rating Filter */}
              <div>
                <h4 className="font-medium mb-3">Rating</h4>
                <div className="space-y-2">
                  {[
                    { value: "4+", label: "4★ & above" },
                    { value: "3+", label: "3★ & above" },
                  ].map((rating) => (
                    <div key={rating.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={rating.value}
                        checked={selectedRatings.includes(rating.value)}
                        onCheckedChange={(checked) => handleRatingChange(rating.value, checked as boolean)}
                      />
                      <Label htmlFor={rating.value} className="text-sm">
                        {rating.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products Grid */}
        <div className="lg:w-3/4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold font-poppins">
              All Products ({sortedProducts.length})
            </h2>
            <div className="flex items-center space-x-4">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Sort by: Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {isLoading
              ? Array(6).fill(0).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="w-full h-48" />
                    <CardContent className="p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-4" />
                      <Skeleton className="h-10 w-full" />
                    </CardContent>
                  </Card>
                ))
              : sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
          </div>

          {!isLoading && sortedProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No products found matching your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
