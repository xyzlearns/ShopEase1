import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import { Link } from "wouter";

export default function Cart() {
  const { cartItems, cartTotal, updateQuantity, removeItem, isUpdating, isRemoving } = useCart();

  const subtotal = cartTotal;
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold font-poppins mb-8">Shopping Cart</h2>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
            <Link href="/products">
              <Button className="bg-primary hover:bg-blue-700 text-white">
                Continue Shopping
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-3xl font-bold font-poppins mb-8">Shopping Cart</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              {cartItems.map((item, index) => (
                <div key={item.id}>
                  <div className="flex items-center space-x-4 p-6">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{item.product.name}</h4>
                      <p className="text-gray-600">₹{item.product.price.toFixed(0)}</p>
                      <Badge className="mt-1 bg-accent text-white">
                        {item.product.category}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity({ id: item.id, quantity: item.quantity - 1 })}
                        disabled={item.quantity <= 1 || isUpdating}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="px-4 py-2 border border-gray-300 rounded min-w-12 text-center">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity({ id: item.id, quantity: item.quantity + 1 })}
                        disabled={isUpdating}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="w-24 text-right">
                      <span className="font-semibold">
                        ₹{(item.product.price * item.quantity).toFixed(0)}
                      </span>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      disabled={isRemoving}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                  {index < cartItems.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>₹{tax.toFixed(0)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>₹{total.toFixed(0)}</span>
                </div>
              </div>
              <Link href="/checkout">
                <Button className="w-full bg-primary hover:bg-blue-700 text-white">
                  Proceed to Checkout
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
