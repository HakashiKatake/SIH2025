import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaContainer } from "../../src/components/ui/SafeAreaContainer";
import { Header } from "../../src/components/ui/Header";
import { ActionButton } from "../../src/components/ui/ActionButton";
import { CartItem } from "../../src/components/dealer/CartItem";
import { useCartStore } from "../../src/store/cartStore";
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
  Layout,
} from "../../src/constants/DesignSystem";

export default function ShoppingCart() {
  const {
    items,
    removeFromCart,
    updateQuantity,
    getTotalAmount,
    createOrder,
    isLoading,
  } = useCartStore();

  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const subtotal = getTotalAmount();
  const shippingCharges = subtotal > 0 ? 50 : 0; // ₹50 shipping
  const total = subtotal + shippingCharges;

  const handleRemoveItem = (productId: string) => {
    Alert.alert(
      "Remove Item",
      "Are you sure you want to remove this item from your cart?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => removeFromCart(productId),
        },
      ]
    );
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      Alert.alert(
        "Empty Cart",
        "Please add items to your cart before checkout."
      );
      return;
    }

    setIsCheckingOut(true);

    try {
      // Mock delivery address for demo
      const deliveryAddress = {
        address: "Dealer Business Address",
        city: "Bangalore",
        state: "Karnataka",
        country: "India",
        coordinates: { latitude: 12.9716, longitude: 77.5946 },
      };

      await createOrder(deliveryAddress, "Order from mobile app");

      Alert.alert(
        "Order Placed!",
        "Your order has been placed successfully. You will receive updates on the order status.",
        [{ text: "OK", onPress: () => router.push("/(tabs)/dealer/orders") }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to place order. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <SafeAreaContainer backgroundColor={Colors.background}>
      <Header
        title="My Cart"
        showBackButton
        onBackPress={() => router.back()}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {items.length === 0 ? (
          <View style={styles.emptyCart}>
            <View style={styles.emptyCartIcon}>
              <Ionicons
                name="cart-outline"
                size={64}
                color={Colors.textTertiary}
              />
            </View>
            <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
            <Text style={styles.emptyCartSubtitle}>
              Browse products and add them to your cart
            </Text>
            <ActionButton
              title="Browse Products"
              variant="primary"
              size="medium"
              onPress={() => router.push("/(tabs)/dealer/marketplace")}
            />
          </View>
        ) : (
          <>
            {/* Cart Items */}
            <View style={styles.cartItemsContainer}>
              {items.map((item) => (
                <CartItem
                  key={item.productId}
                  item={item}
                  onRemove={handleRemoveItem}
                  onUpdateQuantity={updateQuantity}
                />
              ))}
            </View>

            {/* Order Summary */}
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Order Summary</Text>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>
                  ₹{subtotal.toLocaleString()}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shipping charges</Text>
                <Text style={styles.summaryValue}>
                  ₹{shippingCharges.toLocaleString()}
                </Text>
              </View>

              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>₹{total.toLocaleString()}</Text>
              </View>
            </View>

            {/* Checkout Button */}
            <View style={styles.checkoutContainer}>
              <ActionButton
                title={isCheckingOut ? "Processing..." : "Checkout"}
                variant="primary"
                size="large"
                onPress={handleCheckout}
                disabled={isCheckingOut || isLoading}
                loading={isCheckingOut || isLoading}
              />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: Layout.screenPadding,
  },

  // Empty Cart Styles
  emptyCart: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing["2xl"],
    paddingVertical: Spacing["5xl"],
  },
  emptyCartIcon: {
    marginBottom: Spacing["2xl"],
  },
  emptyCartTitle: {
    fontSize: Typography.headingMedium,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  emptyCartSubtitle: {
    fontSize: Typography.bodyMedium,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: Spacing["3xl"],
    lineHeight: 20,
  },

  // Cart Items Container
  cartItemsContainer: {
    marginBottom: Spacing["2xl"],
  },

  // Order Summary Styles
  summaryContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing["2xl"],
    ...Shadows.md,
  },
  summaryTitle: {
    fontSize: Typography.headingSmall,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  summaryLabel: {
    fontSize: Typography.bodyMedium,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: Typography.medium,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: Typography.bodyLarge,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
  },
  totalValue: {
    fontSize: Typography.bodyLarge,
    fontWeight: Typography.bold,
    color: Colors.primary,
  },

  // Checkout Button Container
  checkoutContainer: {
    paddingBottom: Spacing.xl,
  },
});
