import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useCartStore } from '../../../src/store/cartStore';
import { useAuthStore } from '../../../src/store/authStore';
import { Order, OrderStatus } from '../../../src/types';

export default function DealerOrders() {
  const router = useRouter();
  const { orders, getOrders, updateOrderStatus, isLoading } = useCartStore();
  const { token } = useAuthStore();
  
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  const statusOptions = ['All', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
  
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      await getOrders(token || '');
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const filteredOrders = selectedStatus === 'All' 
    ? orders 
    : orders.filter(order => order.status.toLowerCase() === selectedStatus.toLowerCase());

  const handleOrderPress = (order: Order) => {
    router.push({
      pathname: '/dealer/order-details',
      params: { orderId: order.id }
    });
  };

  const handleCancelOrder = (orderId: string) => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: () => updateOrderStatus(orderId, OrderStatus.CANCELLED)
        }
      ]
    );
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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const renderOrderCard = (order: Order) => (
    <TouchableOpacity
      key={order.id}
      className="bg-white rounded-lg p-4 mb-4 shadow-sm"
      onPress={() => handleOrderPress(order)}
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-800 mb-1">
            Order #{order.id}
          </Text>
          <Text className="text-sm text-gray-600">
            Ordered on {formatDate(order.orderDate)}
          </Text>
        </View>
        
        <View className={`px-3 py-1 rounded-full ${statusColors[order.status as keyof typeof statusColors]}`}>
          <Text className="text-sm font-medium">
            {getStatusIcon(order.status)} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Text>
        </View>
      </View>

      <View className="border-t border-gray-200 pt-3">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-gray-600">Total Amount:</Text>
          <Text className="text-lg font-bold text-green-600">
            ₹{order.totalAmount.toLocaleString()}
          </Text>
        </View>
        
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-gray-600">Items:</Text>
          <Text className="text-gray-800">
            {order.products.length} product(s)
          </Text>
        </View>
        
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-gray-600">Expected Delivery:</Text>
          <Text className="text-gray-800">
            {formatDate(order.expectedDeliveryDate)}
          </Text>
        </View>

        {/* Order Items Preview */}
        <View className="bg-gray-50 rounded-lg p-3 mb-3">
          <Text className="text-sm font-medium text-gray-700 mb-2">Items:</Text>
          {order.products.slice(0, 2).map((item, index) => (
            <Text key={index} className="text-sm text-gray-600">
              • {item.quantity} units @ ₹{item.pricePerUnit} each
            </Text>
          ))}
          {order.products.length > 2 && (
            <Text className="text-sm text-gray-500 mt-1">
              +{order.products.length - 2} more items
            </Text>
          )}
        </View>

        <View className="flex-row justify-between">
          <TouchableOpacity
            className="flex-1 bg-blue-100 py-2 rounded-lg mr-2"
            onPress={() => handleOrderPress(order)}
          >
            <Text className="text-blue-800 text-center font-medium">View Details</Text>
          </TouchableOpacity>
          
          {order.status === 'pending' && (
            <TouchableOpacity
              className="flex-1 bg-red-100 py-2 rounded-lg ml-2"
              onPress={() => handleCancelOrder(order.id)}
            >
              <Text className="text-red-800 text-center font-medium">Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView className="flex-1 bg-blue-50">
      <View className="p-6">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-blue-800 mb-2">
            My Orders
          </Text>
          <Text className="text-blue-600">
            Track your crop purchases and deliveries
          </Text>
        </View>

        {/* Order Status Filter */}
        <View className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            Filter by Status
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {statusOptions.map((status) => (
              <TouchableOpacity 
                key={status}
                className={`px-4 py-2 rounded-full mr-3 ${
                  selectedStatus === status ? 'bg-blue-600' : 'bg-blue-100'
                }`}
                onPress={() => setSelectedStatus(status)}
              >
                <Text className={`${
                  selectedStatus === status ? 'text-white' : 'text-blue-800'
                }`}>
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Orders Summary */}
        <View className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <View className="flex-row justify-between items-center">
            <Text className="text-lg font-semibold text-gray-800">
              Orders Summary
            </Text>
            <TouchableOpacity onPress={loadOrders}>
              <Text className="text-blue-600">Refresh</Text>
            </TouchableOpacity>
          </View>
          
          <View className="flex-row justify-between mt-3">
            <View className="items-center">
              <Text className="text-2xl font-bold text-blue-600">{orders.length}</Text>
              <Text className="text-sm text-gray-600">Total Orders</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-yellow-600">
                {orders.filter(o => o.status === 'pending').length}
              </Text>
              <Text className="text-sm text-gray-600">Pending</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-green-600">
                {orders.filter(o => o.status === 'delivered').length}
              </Text>
              <Text className="text-sm text-gray-600">Delivered</Text>
            </View>
          </View>
        </View>

        {/* Orders List */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-gray-800">
              {selectedStatus === 'All' ? 'All Orders' : `${selectedStatus} Orders`}
            </Text>
            <Text className="text-sm text-gray-500">
              {filteredOrders.length} order(s)
            </Text>
          </View>

          {isLoading ? (
            <View className="bg-white rounded-lg p-8 items-center shadow-sm">
              <Text className="text-gray-600">Loading orders...</Text>
            </View>
          ) : filteredOrders.length > 0 ? (
            filteredOrders.map(renderOrderCard)
          ) : (
            <View className="bg-white rounded-lg p-8 items-center shadow-sm">
              <Text className="text-6xl mb-4">📦</Text>
              <Text className="text-xl font-semibold text-gray-800 mb-2">
                No orders found
              </Text>
              <Text className="text-gray-600 text-center mb-6">
                {selectedStatus === 'All' 
                  ? 'Start shopping to see your orders here!'
                  : `No ${selectedStatus.toLowerCase()} orders found.`
                }
              </Text>
              <TouchableOpacity
                className="bg-blue-600 px-6 py-3 rounded-lg"
                onPress={() => router.push('/dealer/marketplace')}
              >
                <Text className="text-white font-medium">Browse Marketplace</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}