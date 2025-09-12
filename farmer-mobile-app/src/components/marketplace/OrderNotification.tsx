import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Order } from '../../types';
import { useMarketplaceStore } from '../../store/marketplaceStore';
import { useAuthStore } from '../../store/authStore';

interface OrderNotificationProps {
  order: Order;
  onDismiss?: () => void;
}

export function OrderNotification({ order, onDismiss }: OrderNotificationProps) {
  const { updateOrderStatus } = useMarketplaceStore();
  const { token } = useAuthStore();

  const handleAcceptOrder = async () => {
    try {
      await updateOrderStatus(order.id, 'confirmed', token!);
      Alert.alert('Success', 'Order accepted successfully!');
      onDismiss?.();
    } catch (error) {
      Alert.alert('Error', 'Failed to accept order. Please try again.');
    }
  };

  const handleRejectOrder = () => {
    Alert.alert(
      'Reject Order',
      'Are you sure you want to reject this order?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateOrderStatus(order.id, 'cancelled', token!);
              Alert.alert('Order Rejected', 'The order has been rejected.');
              onDismiss?.();
            } catch (error) {
              Alert.alert('Error', 'Failed to reject order. Please try again.');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <View className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
      {/* Header */}
      <View className="flex-row justify-between items-start mb-3">
        <View>
          <Text className="text-lg font-semibold text-gray-800">
            New Order #{order.id.slice(-6)}
          </Text>
          <Text className="text-sm text-gray-500">
            {new Date(order.orderDate).toLocaleDateString()}
          </Text>
        </View>
        <View className={`px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
          <Text className="text-xs font-medium uppercase">
            {order.status}
          </Text>
        </View>
      </View>

      {/* Order Details */}
      <View className="mb-4">
        <Text className="text-2xl font-bold text-green-600 mb-2">
          ₹{order.totalAmount}
        </Text>
        
        <Text className="text-gray-600 mb-1">
          Items: {order.products.length}
        </Text>
        
        <Text className="text-gray-600 mb-1">
          Delivery: {order.deliveryAddress.city}, {order.deliveryAddress.state}
        </Text>
        
        {order.notes && (
          <Text className="text-gray-600 italic mt-2">
            Note: "{order.notes}"
          </Text>
        )}
      </View>

      {/* Product List */}
      <View className="mb-4">
        <Text className="font-semibold text-gray-700 mb-2">Ordered Items:</Text>
        {order.products.map((item, index) => (
          <View key={index} className="flex-row justify-between py-1">
            <Text className="text-gray-600">Product #{item.productId.slice(-4)}</Text>
            <Text className="text-gray-600">
              {item.quantity} × ₹{item.pricePerUnit} = ₹{item.totalPrice}
            </Text>
          </View>
        ))}
      </View>

      {/* Action Buttons */}
      {order.status === 'pending' && (
        <View className="flex-row space-x-3">
          <TouchableOpacity 
            className="flex-1 bg-red-600 rounded-lg py-3"
            onPress={handleRejectOrder}
          >
            <Text className="text-white text-center font-semibold">Reject</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="flex-1 bg-green-600 rounded-lg py-3"
            onPress={handleAcceptOrder}
          >
            <Text className="text-white text-center font-semibold">Accept</Text>
          </TouchableOpacity>
        </View>
      )}

      {order.status === 'confirmed' && (
        <TouchableOpacity 
          className="bg-blue-600 rounded-lg py-3"
          onPress={() => updateOrderStatus(order.id, 'shipped', token!)}
        >
          <Text className="text-white text-center font-semibold">Mark as Shipped</Text>
        </TouchableOpacity>
      )}

      {order.status === 'shipped' && (
        <TouchableOpacity 
          className="bg-green-600 rounded-lg py-3"
          onPress={() => updateOrderStatus(order.id, 'delivered', token!)}
        >
          <Text className="text-white text-center font-semibold">Mark as Delivered</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}