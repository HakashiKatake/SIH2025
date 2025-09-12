import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCartStore } from '../../src/store/cartStore';
import { useAuthStore } from '../../src/store/authStore';
import { Order, OrderStatus } from '../../src/types';

export default function OrderDetails() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams();
  const { orders, updateOrderStatus } = useCartStore();
  const { token } = useAuthStore();
  
  const [order, setOrder] = useState<Order | null>(null);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
    shipped: 'bg-purple-100 text-purple-800 border-purple-200',
    delivered: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200'
  };

  // Mock farmer contact info
  const farmerContact = {
    name: 'Rajesh Kumar',
    phone: '+91 98765 43210',
    email: 'rajesh.farmer@example.com',
    farmName: 'Green Valley Farm'
  };

  useEffect(() => {
    // Find order by ID
    const foundOrder = orders.find(o => o.id === orderId);
    if (foundOrder) {
      setOrder(foundOrder);
    } else {
      // Mock order for demo
      const mockOrder: Order = {
        id: orderId as string,
        dealerId: 'current-dealer',
        farmerId: 'farmer1',
        products: [
          {
            productId: '1',
            quantity: 10,
            pricePerUnit: 25,
            totalPrice: 250
          },
          {
            productId: '2',
            quantity: 5,
            pricePerUnit: 40,
            totalPrice: 200
          }
        ],
        totalAmount: 525, // Including delivery and platform fees
        status: OrderStatus.CONFIRMED,
        deliveryAddress: {
          address: '123 Business Street, Commercial Area',
          city: 'Bangalore',
          state: 'Karnataka',
          country: 'India',
          coordinates: { latitude: 12.9716, longitude: 77.5946 }
        },
        orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        expectedDeliveryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        notes: 'Please deliver fresh produce. Call before delivery.'
      };
      setOrder(mockOrder);
    }
  }, [orderId, orders]);

  const handleCancelOrder = () => {
    if (!order) return;
    
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: async () => {
            await updateOrderStatus(order.id, OrderStatus.CANCELLED);
            setOrder({ ...order, status: OrderStatus.CANCELLED });
            Alert.alert('Order Cancelled', 'Your order has been cancelled successfully.');
          }
        }
      ]
    );
  };

  const handleContactFarmer = (method: 'call' | 'message') => {
    if (method === 'call') {
      Linking.openURL(`tel:${farmerContact.phone}`);
    } else {
      Alert.alert(
        'Contact Farmer',
        'This feature will open the messaging interface with the farmer.',
        [{ text: 'OK' }]
      );
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return '⏳';
      case 'confirmed': return '✅';
      case 'shipped': return '🚚';
      case 'delivered': return '📦';
      case 'cancelled': return '❌';
      default: return '📋';
    }
  };

  const getOrderProgress = (status: string) => {
    const steps = ['pending', 'confirmed', 'shipped', 'delivered'];
    const currentIndex = steps.indexOf(status.toLowerCase());
    return Math.max(0, currentIndex + 1);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!order) {
    return (
      <View className="flex-1 bg-blue-50 items-center justify-center">
        <Text className="text-gray-600">Order not found</Text>
        <TouchableOpacity
          className="mt-4 bg-blue-600 px-6 py-3 rounded-lg"
          onPress={() => router.back()}
        >
          <Text className="text-white font-medium">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-blue-50">
      {/* Header */}
      <View className="bg-white p-4 shadow-sm">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-blue-600 text-lg">← Back</Text>
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-800">Order Details</Text>
          <View />
        </View>
      </View>

      <View className="p-6">
        {/* Order Header */}
        <View className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <View className="flex-row justify-between items-start mb-4">
            <View>
              <Text className="text-2xl font-bold text-gray-800 mb-1">
                Order #{order.id}
              </Text>
              <Text className="text-gray-600">
                Placed on {formatDate(order.orderDate)}
              </Text>
            </View>
            
            <View className={`px-4 py-2 rounded-full border ${statusColors[order.status as keyof typeof statusColors]}`}>
              <Text className="font-medium">
                {getStatusIcon(order.status)} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Text>
            </View>
          </View>

          {/* Order Progress */}
          {order.status !== 'cancelled' && (
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-3">Order Progress</Text>
              <View className="flex-row justify-between items-center">
                {['Pending', 'Confirmed', 'Shipped', 'Delivered'].map((step, index) => {
                  const isActive = index < getOrderProgress(order.status);
                  const isCurrent = index === getOrderProgress(order.status) - 1;
                  
                  return (
                    <View key={step} className="items-center flex-1">
                      <View className={`w-8 h-8 rounded-full items-center justify-center ${
                        isActive ? 'bg-blue-600' : 'bg-gray-300'
                      } ${isCurrent ? 'ring-2 ring-blue-300' : ''}`}>
                        <Text className={`text-sm font-bold ${
                          isActive ? 'text-white' : 'text-gray-600'
                        }`}>
                          {index + 1}
                        </Text>
                      </View>
                      <Text className={`text-xs mt-1 text-center ${
                        isActive ? 'text-blue-600 font-medium' : 'text-gray-500'
                      }`}>
                        {step}
                      </Text>
                      {index < 3 && (
                        <View className={`absolute top-4 left-1/2 w-full h-0.5 ${
                          index < getOrderProgress(order.status) - 1 ? 'bg-blue-600' : 'bg-gray-300'
                        }`} style={{ marginLeft: '50%', width: '100%' }} />
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          <View className="border-t border-gray-200 pt-4">
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Expected Delivery:</Text>
              <Text className="font-medium text-gray-800">
                {formatDate(order.expectedDeliveryDate)}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Total Amount:</Text>
              <Text className="text-xl font-bold text-green-600">
                ₹{order.totalAmount.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Farmer Information */}
        <View className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            Farmer Information
          </Text>
          
          <View className="flex-row items-center mb-4">
            <View className="w-12 h-12 bg-gray-200 rounded-full items-center justify-center mr-4">
              <Text className="text-xl">👨‍🌾</Text>
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-800">
                {farmerContact.name}
              </Text>
              <Text className="text-gray-600">{farmerContact.farmName}</Text>
            </View>
          </View>

          <View className="flex-row space-x-3">
            <TouchableOpacity
              className="flex-1 bg-green-100 py-3 rounded-lg"
              onPress={() => handleContactFarmer('call')}
            >
              <Text className="text-green-800 text-center font-medium">📞 Call</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-blue-100 py-3 rounded-lg"
              onPress={() => handleContactFarmer('message')}
            >
              <Text className="text-blue-800 text-center font-medium">💬 Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Order Items */}
        <View className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            Order Items ({order.products.length})
          </Text>
          
          {order.products.map((item, index) => (
            <View key={index} className="flex-row justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
              <View className="flex-1">
                <Text className="font-medium text-gray-800 mb-1">
                  Product #{item.productId}
                </Text>
                <Text className="text-sm text-gray-600">
                  {item.quantity} units × ₹{item.pricePerUnit}
                </Text>
              </View>
              <Text className="text-lg font-bold text-gray-800">
                ₹{item.totalPrice.toLocaleString()}
              </Text>
            </View>
          ))}
        </View>

        {/* Delivery Address */}
        <View className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            Delivery Address
          </Text>
          <View className="bg-gray-50 rounded-lg p-3">
            <Text className="text-gray-800 leading-6">
              {order.deliveryAddress.address}
            </Text>
            <Text className="text-gray-800">
              {order.deliveryAddress.city}, {order.deliveryAddress.state}
            </Text>
            <Text className="text-gray-800">
              {order.deliveryAddress.country}
            </Text>
          </View>
        </View>

        {/* Order Notes */}
        {order.notes && (
          <View className="bg-white rounded-lg p-4 mb-6 shadow-sm">
            <Text className="text-lg font-semibold text-gray-800 mb-3">
              Order Notes
            </Text>
            <View className="bg-gray-50 rounded-lg p-3">
              <Text className="text-gray-700">{order.notes}</Text>
            </View>
          </View>
        )}

        {/* Price Breakdown */}
        <View className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            Price Breakdown
          </Text>
          
          <View className="space-y-3">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Subtotal:</Text>
              <Text className="text-gray-800">
                ₹{order.products.reduce((sum, item) => sum + item.totalPrice, 0).toLocaleString()}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Delivery Fee:</Text>
              <Text className="text-gray-800">₹50</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Platform Fee:</Text>
              <Text className="text-gray-800">₹25</Text>
            </View>
            <View className="border-t border-gray-200 pt-3">
              <View className="flex-row justify-between">
                <Text className="text-lg font-bold text-gray-800">Total:</Text>
                <Text className="text-lg font-bold text-green-600">
                  ₹{order.totalAmount.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="space-y-3">
          {order.status === 'pending' && (
            <TouchableOpacity
              className="bg-red-600 py-4 rounded-lg"
              onPress={handleCancelOrder}
            >
              <Text className="text-white text-center text-lg font-semibold">
                Cancel Order
              </Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            className="bg-blue-600 py-4 rounded-lg"
            onPress={() => router.push('/dealer/marketplace')}
          >
            <Text className="text-white text-center text-lg font-semibold">
              Continue Shopping
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className="border border-gray-300 py-4 rounded-lg"
            onPress={() => router.push('/dealer/orders')}
          >
            <Text className="text-gray-700 text-center font-medium">
              View All Orders
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}