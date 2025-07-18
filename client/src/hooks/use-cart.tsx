import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { CartItem, Product } from "@shared/schema";

type CartItemWithProduct = CartItem & { product: Product };

function getSessionId() {
  if (typeof window === 'undefined') return 'default';
  
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
}

export function useCart() {
  const queryClient = useQueryClient();
  const [sessionId, setSessionId] = useState<string>('default');

  useEffect(() => {
    setSessionId(getSessionId());
  }, []);

  const { data: cartItems = [], isLoading } = useQuery<CartItemWithProduct[]>({
    queryKey: ['/api/cart', sessionId],
    queryFn: async () => {
      const response = await fetch('/api/cart', {
        headers: {
          'X-Session-Id': sessionId,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch cart');
      return response.json();
    },
    enabled: sessionId !== 'default',
  });

  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity = 1 }: { productId: number; quantity?: number }) => {
      return apiRequest('POST', '/api/cart', { productId, quantity }, {
        'X-Session-Id': sessionId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart', sessionId] });
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      return apiRequest('PUT', `/api/cart/${id}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart', sessionId] });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/cart/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart', sessionId] });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('DELETE', '/api/cart', undefined, {
        'X-Session-Id': sessionId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart', sessionId] });
    },
  });

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);

  return {
    cartItems,
    cartCount,
    cartTotal,
    isLoading,
    addToCart: addToCartMutation.mutate,
    updateQuantity: updateQuantityMutation.mutate,
    removeItem: removeItemMutation.mutate,
    clearCart: clearCartMutation.mutate,
    isAddingToCart: addToCartMutation.isPending,
    isUpdating: updateQuantityMutation.isPending,
    isRemoving: removeItemMutation.isPending,
    sessionId,
  };
}
