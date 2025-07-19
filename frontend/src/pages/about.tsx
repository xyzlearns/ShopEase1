import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag, Shield, Truck, Heart } from "lucide-react";

export default function About() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-poppins text-gray-900 mb-4">
          About ShopSpace
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Your trusted partner in online shopping, delivering quality products 
          with exceptional service since our founding.
        </p>
      </div>

      {/* Mission Section */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle className="text-2xl font-poppins">Our Mission</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-lg leading-relaxed">
            At ShopSpace, we believe shopping should be simple, secure, and enjoyable. 
            We're committed to providing high-quality products at competitive prices 
            while delivering an exceptional customer experience that exceeds expectations.
          </p>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="text-center">
          <CardContent className="pt-6">
            <ShoppingBag className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Quality Products</h3>
            <p className="text-gray-600 text-sm">
              Carefully curated selection of premium products from trusted brands
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Secure Shopping</h3>
            <p className="text-gray-600 text-sm">
              Advanced security measures to protect your personal and payment information
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <Truck className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Fast Delivery</h3>
            <p className="text-gray-600 text-sm">
              Quick and reliable shipping to get your orders to you when you need them
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Customer Care</h3>
            <p className="text-gray-600 text-sm">
              Dedicated support team ready to help with any questions or concerns
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Company Info */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <Card>
          <CardHeader>
            <CardTitle>Our Story</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Founded with a vision to revolutionize online shopping, ShopSpace 
              has grown from a small startup to a trusted e-commerce platform 
              serving customers worldwide.
            </p>
            <p className="text-gray-600">
              We started with a simple idea: make online shopping easier, 
              safer, and more enjoyable for everyone. Today, we continue 
              to innovate and improve our platform to serve you better.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Our Values</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Badge variant="outline">Quality</Badge>
                <span className="text-gray-600">We never compromise on product quality</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline">Trust</Badge>
                <span className="text-gray-600">Building lasting relationships with customers</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline">Innovation</Badge>
                <span className="text-gray-600">Constantly improving our platform and services</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline">Service</Badge>
                <span className="text-gray-600">Putting customer satisfaction first</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle>Get in Touch</CardTitle>
          <CardDescription>
            Have questions or feedback? We'd love to hear from you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Customer Support</h4>
              <p className="text-gray-600 text-sm">
                Email: support@shopspace.com<br />
                Phone: 1-800-SHOPSPACE<br />
                Hours: 9 AM - 6 PM EST
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Business Inquiries</h4>
              <p className="text-gray-600 text-sm">
                Email: business@shopspace.com<br />
                Phone: 1-800-SHOP-BIZ<br />
                Hours: 9 AM - 5 PM EST
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Press & Media</h4>
              <p className="text-gray-600 text-sm">
                Email: press@shopspace.com<br />
                Phone: 1-800-SHOP-NEWS<br />
                Hours: 9 AM - 5 PM EST
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}