import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { checkoutSchema, type CheckoutData } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

export default function Checkout() {
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const { cartItems, cartTotal, sessionId } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<CheckoutData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      address: "",
      city: "",
      state: "",
      zip: "",
    },
  });

  const subtotal = cartTotal;
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const orderMutation = useMutation({
    mutationFn: async (data: CheckoutData) => {
      const formData = new FormData();
      
      // Add form fields
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });
      
      // Add payment screenshot if provided
      if (paymentFile) {
        formData.append('paymentScreenshot', paymentFile);
      }

      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'X-Session-Id': sessionId,
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      return response.json();
    },
    onSuccess: () => {
      setShowSuccess(true);
      form.reset();
      setPaymentFile(null);
    },
    onError: (error: any) => {
      // Extract error message from response
      const errorMessage = error?.message || "Failed to process your order. Please try again.";
      
      toast({
        title: "Order failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CheckoutData) => {
    if (cartItems.length === 0) {
      toast({
        title: "Empty cart",
        description: "Your cart is empty. Please add items before checkout.",
        variant: "destructive",
      });
      return;
    }

    if (!paymentFile) {
      toast({
        title: "Payment screenshot required",
        description: "Please upload a payment screenshot to complete your order.",
        variant: "destructive",
      });
      return;
    }

    orderMutation.mutate(data);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a JPEG, JPG, or PNG image.",
          variant: "destructive",
        });
        e.target.value = ''; // Reset file input
        return;
      }
      
      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB.",
          variant: "destructive",
        });
        e.target.value = ''; // Reset file input
        return;
      }
      
      setPaymentFile(file);
      toast({
        title: "File uploaded successfully",
        description: "Payment screenshot ready for submission.",
        variant: "default",
      });
    }
  };

  const closeSuccessModal = () => {
    setShowSuccess(false);
    window.location.href = '/';
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold font-poppins mb-8">Checkout</h2>
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
      <h2 className="text-3xl font-bold font-poppins mb-8">Checkout</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Checkout Form */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-6">Billing Information</h3>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="zip"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP Code</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Payment Method */}
                <div className="pt-6">
                  <h4 className="text-md font-semibold mb-4">Payment Method *</h4>
                  <Card className={`border-2 ${paymentFile ? 'border-green-500 bg-green-50' : 'border-dashed border-gray-300'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-medium">Pay with UPI</span>
                        <img
                          src="/assets/upi-qr.jpeg"
                          alt="UPI QR Code"
                          className="w-32 h-32 border border-gray-200 rounded-lg object-cover"
                          onError={(e) => {
                            console.error('Failed to load UPI QR code image');
                            // Show fallback text instead of hiding the element
                            e.currentTarget.outerHTML = '<div class="w-32 h-32 border border-gray-200 rounded-lg flex items-center justify-center bg-gray-100 text-xs text-gray-500 text-center p-2">UPI QR Code<br/>Scan to Pay</div>';
                          }}
                        />
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Scan the QR code with any UPI app to complete your payment
                      </p>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Upload Payment Screenshot *
                        </label>
                        <Input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png"
                          onChange={handleFileChange}
                          className="cursor-pointer"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Required: Upload a screenshot of your UPI payment (JPEG, JPG, or PNG, max 5MB)
                        </p>
                        {paymentFile && (
                          <p className="text-sm text-green-600 mt-2">
                            ✓ File selected: {paymentFile.name}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Button
                  type="submit"
                  disabled={orderMutation.isPending || !paymentFile}
                  className="w-full bg-primary hover:bg-blue-700 text-white mt-6 disabled:opacity-50"
                >
                  {orderMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : !paymentFile ? (
                    "Upload Payment Screenshot to Complete"
                  ) : (
                    "Complete Order"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card className="h-fit">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
            
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-4">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.product.name}</h4>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-semibold">
                    ₹{(item.product.price * item.quantity).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>

            <Separator className="mb-4" />
            
            <div className="space-y-2">
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
          </CardContent>
        </Card>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <DialogTitle className="text-center text-2xl">
              Order Placed Successfully!
            </DialogTitle>
            <DialogDescription className="text-center">
              Thank you for your purchase. We'll send you a confirmation email shortly.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={closeSuccessModal} className="w-full bg-primary hover:bg-blue-700 text-white">
            Continue Shopping
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
