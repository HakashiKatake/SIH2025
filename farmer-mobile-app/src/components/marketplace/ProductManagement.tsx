import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { MarketplaceProduct } from "../../types";
import { useMarketplaceStore } from "../../store/marketplaceStore";
import { useAuthStore } from "../../store/authStore";

interface ProductManagementProps {
  product: MarketplaceProduct;
}

export function ProductManagement({ product }: ProductManagementProps) {
  const router = useRouter();
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const { deleteListing, updateListingStatus } = useMarketplaceStore();
  const { token } = useAuthStore();

  const handleEdit = () => {
    router.push(`/farmer/edit-product/${product.id}`);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Listing",
      "Are you sure you want to delete this listing? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteListing(product.id, token!);
              Alert.alert("Success", "Listing deleted successfully");
            } catch (error) {
              Alert.alert("Error", "Failed to delete listing");
            }
          },
        },
      ]
    );
  };

  const handleToggleStatus = async () => {
    const newStatus = product.status === "available" ? "sold" : "available";
    const action = newStatus === "sold" ? "mark as sold" : "mark as available";

    Alert.alert("Update Status", `Are you sure you want to ${action}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Confirm",
        onPress: async () => {
          try {
            await updateListingStatus(product.id, newStatus, token!);
            Alert.alert("Success", `Product ${action} successfully`);
          } catch (error) {
            Alert.alert("Error", "Failed to update status");
          }
        },
      },
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-600";
      case "sold":
        return "bg-gray-100 text-gray-600";
      case "reserved":
        return "bg-yellow-100 text-yellow-600";
      case "expired":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      <View className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-100">
        <TouchableOpacity onPress={() => setShowDetailsModal(true)}>
          <View className="flex-row">
            {/* Product Image */}
            {product.photos.length > 0 ? (
              <Image
                source={{ uri: product.photos[0] }}
                className="w-20 h-20 rounded-lg mr-3"
                resizeMode="cover"
              />
            ) : (
              <View className="w-20 h-20 rounded-lg mr-3 bg-gray-200 items-center justify-center">
                <Text className="text-gray-400 text-2xl">📦</Text>
              </View>
            )}

            {/* Product Info */}
            <View className="flex-1">
              <View className="flex-row justify-between items-start mb-2">
                <Text className="text-lg font-semibold text-gray-800 flex-1 mr-2">
                  {product.name}
                </Text>
                <View
                  className={`px-2 py-1 rounded-full ${getStatusColor(
                    product.status
                  )}`}
                >
                  <Text className="text-xs font-medium uppercase">
                    {product.status}
                  </Text>
                </View>
              </View>

              <Text className="text-green-600 font-bold text-lg mb-1">
                ₹{product.pricePerUnit}/{product.unit}
              </Text>

              <Text className="text-gray-600 text-sm mb-1">
                Quantity: {product.quantity} {product.unit}
              </Text>

              <Text className="text-gray-500 text-xs">
                Listed: {formatDate(product.createdAt)}
              </Text>

              {product.availableUntil && (
                <Text className="text-gray-500 text-xs">
                  Available until: {formatDate(product.availableUntil)}
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View className="flex-row mt-4 space-x-2">
          <TouchableOpacity
            className="flex-1 bg-blue-600 rounded-lg py-2"
            onPress={handleEdit}
          >
            <Text className="text-white text-center font-medium">Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 rounded-lg py-2 ${
              product.status === "available" ? "bg-gray-600" : "bg-green-600"
            }`}
            onPress={handleToggleStatus}
          >
            <Text className="text-white text-center font-medium">
              {product.status === "available" ? "Mark Sold" : "Mark Available"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-red-600 rounded-lg py-2"
            onPress={handleDelete}
          >
            <Text className="text-white text-center font-medium">Delete</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Product Details Modal */}
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View className="flex-1 bg-white">
          {/* Header */}
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
            <Text className="text-xl font-bold">Product Details</Text>
            <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
              <Text className="text-blue-600 font-semibold">Close</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-4">
            {/* Product Images */}
            {product.photos.length > 0 && (
              <View className="mb-6">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row space-x-3">
                    {product.photos.map((uri, index) => (
                      <Image
                        key={index}
                        source={{ uri }}
                        className="w-32 h-32 rounded-lg"
                        resizeMode="cover"
                      />
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            {/* Product Information */}
            <View className="space-y-4">
              <View>
                <Text className="text-gray-600 font-medium">Product Name</Text>
                <Text className="text-lg text-gray-800">{product.name}</Text>
              </View>

              <View>
                <Text className="text-gray-600 font-medium">Category</Text>
                <Text className="text-lg text-gray-800 capitalize">
                  {product.category}
                </Text>
              </View>

              {product.variety && (
                <View>
                  <Text className="text-gray-600 font-medium">Variety</Text>
                  <Text className="text-lg text-gray-800">
                    {product.variety}
                  </Text>
                </View>
              )}

              <View className="flex-row space-x-4">
                <View className="flex-1">
                  <Text className="text-gray-600 font-medium">Price</Text>
                  <Text className="text-lg text-green-600 font-bold">
                    ₹{product.pricePerUnit}/{product.unit}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-600 font-medium">Quantity</Text>
                  <Text className="text-lg text-gray-800">
                    {product.quantity} {product.unit}
                  </Text>
                </View>
              </View>

              <View>
                <Text className="text-gray-600 font-medium">Description</Text>
                <Text className="text-gray-800 leading-6">
                  {product.description}
                </Text>
              </View>

              <View>
                <Text className="text-gray-600 font-medium">Status</Text>
                <View
                  className={`self-start px-3 py-1 rounded-full ${getStatusColor(
                    product.status
                  )}`}
                >
                  <Text className="font-medium uppercase">
                    {product.status}
                  </Text>
                </View>
              </View>

              <View>
                <Text className="text-gray-600 font-medium">Location</Text>
                <Text className="text-gray-800">
                  {product.location.city}, {product.location.state}
                </Text>
              </View>

              {product.isOrganic && (
                <View>
                  <Text className="text-gray-600 font-medium">
                    Certification
                  </Text>
                  <View className="bg-green-100 self-start px-3 py-1 rounded-full">
                    <Text className="text-green-600 font-medium">Organic</Text>
                  </View>
                </View>
              )}

              <View className="flex-row space-x-4">
                <View className="flex-1">
                  <Text className="text-gray-600 font-medium">
                    Harvest Date
                  </Text>
                  <Text className="text-gray-800">
                    {formatDate(product.harvestDate)}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-600 font-medium">
                    Available Until
                  </Text>
                  <Text className="text-gray-800">
                    {formatDate(product.availableUntil)}
                  </Text>
                </View>
              </View>

              <View>
                <Text className="text-gray-600 font-medium">Listed On</Text>
                <Text className="text-gray-800">
                  {formatDate(product.createdAt)}
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}
