import { X, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";
import { Link } from "wouter";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { cartItems, cartTotal, updateQuantity, removeItem, isUpdating, isRemoving } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Shopping Cart</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 max-h-[calc(100vh-160px)]">
          {cartItems.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Your cart is empty</p>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.product.name}</h4>
                    <p className="text-sm text-gray-600">₹{item.product.price.toFixed(0)}</p>
                    
                    <div className="flex items-center space-x-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity({ id: item.id, quantity: item.quantity - 1 })}
                        disabled={item.quantity <= 1 || isUpdating}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Badge variant="secondary">{item.quantity}</Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity({ id: item.id, quantity: item.quantity + 1 })}
                        disabled={isUpdating}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{(item.product.price * item.quantity).toFixed(0)}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      disabled={isRemoving}
                      className="text-red-500 hover:text-red-700 mt-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t p-4">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold">Total:</span>
              <span className="font-bold text-lg">₹{cartTotal.toFixed(0)}</span>
            </div>
            <Link href="/cart" onClick={onClose}>
              <Button className="w-full bg-primary hover:bg-blue-700 text-white">
                View Cart
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
