'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface CartItem {
  cartItemId: string;
  id: string;
  name: string;
  price: number;
  flavorprice?: number;
  flavorId?: string;
  addonId?: string;
  emoji: string;
  quantity: number;
  special?: string;
  itemType?: 'drink' | 'addon';
}

interface BaseDrink {
  id: string;
  name: string;
  description: string;
  price: number;
  emoji?: string;
}

interface Flavor {
  id: string;
  name: string;
  description: string;
  price: number;
  emoji?: string;
}

interface Addons{
  id: string;
  name: string;
  description: string;
  price: number;
}

interface Table {
  id: string;
  table_number: number;
  is_occupied: boolean;
}

const toAmount = (value: number) => Math.round(value);

type ViewState = 'order' | 'builder' | 'confirmation';

export default function CustomerInterface() {
  const [baseDrinks, setBaseDrinks] = useState<BaseDrink[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<BaseDrink | null>(null);
  const [selectedFlavor, setSelectedFlavor] = useState<Flavor | null>(null);
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [view, setView] = useState<ViewState>('order');
  const [availableAddOns, setAvailableAddOns] = useState<Addons[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [orderId, setOrderId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [selectedTableNumber, setSelectedTableNumber] = useState('');

  useEffect(() => {
    const fetchDrinks = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/basedrink/userget`);
        setBaseDrinks(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchDrinks();
  }, []);

  useEffect(() => {
    const fetchAddOns = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/addon/userget`);
        setAvailableAddOns(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAddOns();
  }, []);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/table/userget`);
        setTables(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchTables();
  }, []);

  const fetchFlavors = async (productId: string) => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/flavor/userget/${productId}`
      );
      setFlavors(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const clearBuilderState = () => {
    setSelectedProduct(null);
    setFlavors([]);
    setSelectedFlavor(null);
    setQuantity(1);
  };

  const selectProductForBuilder = (product: BaseDrink) => {
    setSelectedProduct(product);
    setFlavors([]);
    setSelectedFlavor(null);
    setQuantity(1);
    setView('builder');
    fetchFlavors(product.id);
  };

  const addAddonToCart = (addOn: Addons) => {
    setCart(prev => [
      ...prev,
      {
        cartItemId: crypto.randomUUID(),
        id: addOn.id,
        addonId: addOn.id,
        name: addOn.name,
        price: addOn.price,
        emoji: '✨',
        quantity: 1,
        itemType: 'addon',
      },
    ]);
  };

  const addBuiltToCart = () => {
    if (!selectedProduct) return;

    const special = selectedFlavor?.name;

    const cartItem: CartItem = {
      cartItemId: crypto.randomUUID(),
      id: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedProduct.price,
      flavorprice: selectedFlavor?.price,
      flavorId: selectedFlavor?.id,
      emoji: selectedProduct.emoji || '☕',
      quantity,
      special,
      itemType: 'drink',
    };

    setCart(prev => [...prev, cartItem]);

    clearBuilderState();
    setView('order');
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const subtotal = cart.reduce((sum, item) => {
    const unitAmount = toAmount(item.price + (item.flavorprice ?? 0));
    return sum + unitAmount * item.quantity;
  }, 0);

  const orderRemarks = Array.from(
    new Set(
      cart.flatMap(item => {
        if (item.special) return [item.special];
        if (item.itemType === 'addon') return [item.name];
        return [];
      })
    )
  ).join(', ');

  const submitOrder = async () => {
    if (!cart.length) return;

    if (!selectedTableNumber) {
      const confirmTakeaway = window.confirm('The order will be a take away');

      if (!confirmTakeaway) {
        return;
      }
    }

    const payload = {
      payment_method: 'ONLINE',
      table_number: selectedTableNumber ? Number(selectedTableNumber) : null,
      name: customerName,
      remarks: orderRemarks,
      items: cart.map(ci =>
        ci.itemType === 'addon'
          ? {
              baseDrinkId: null,
              addonId: ci.addonId ?? ci.id,
              quantity: ci.quantity,
              flavorIds: [],
            }
          : {
              baseDrinkId: ci.id,
              addonId: null,
              quantity: ci.quantity,
              flavorIds: ci.flavorId ? [ci.flavorId] : [],
            }
      )
    };

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/order/create/online`, payload);
    } catch (err) {
      console.error(err);
    }

    const newOrderId = Math.random().toString(36).substring(2, 9).toUpperCase();
    setOrderId(newOrderId);
    setCart([]);
    clearBuilderState();
    setSelectedTableNumber('');
    setView('confirmation');
  };

  if (view === 'confirmation') {
    return (
      <div className="overflow-y-auto h-full bg-background">
        <div className="max-w-xl mx-auto py-10 sm:py-12 px-4 text-center">
          <div className="text-6xl mb-6">✓</div>
          <h2 className="font-serif text-3xl mb-2">Order Confirmed</h2>
          <div className="text-5xl font-light tracking-tight my-4 font-serif">{customerName || orderId}</div>

          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-5 py-2 rounded-full text-sm font-medium mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-700 animate-pulse"></div>
            Being prepared
          </div>

          <div className="text-left space-y-3 mb-8 border-t border-b border-border py-6">
            <div className="flex items-center gap-3 py-3 border-b border-border">
              <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0"></div>
              <span className="text-sm text-muted-foreground">Order Placed</span>
            </div>
            <div className="flex items-center gap-3 py-3 border-b border-border">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse flex-shrink-0"></div>
              <span className="text-sm font-medium">Being Prepared</span>
            </div>
            <div className="flex items-center gap-3 py-3">
              <div className="w-2 h-2 rounded-full bg-border flex-shrink-0"></div>
              <span className="text-sm text-muted-foreground">Ready for Pickup</span>
            </div>
          </div>

          <button
            onClick={() => setView('order')}
            className="w-full bg-foreground text-background py-3 rounded-lg font-medium hover:opacity-90 transition"
          >
            Place Another Order
          </button>
        </div>
      </div>
    );
  }

  if (view === 'builder' && selectedProduct) {
    return (
      <div className="overflow-y-auto h-full bg-background">
        <div className="max-w-2xl mx-auto py-6 px-4 sm:px-6">
          <button
            onClick={() => {
              setView('order');
              clearBuilderState();
            }}
            className="text-muted-foreground hover:text-foreground text-sm mb-6 cursor-pointer"
          >
            ← Back
          </button>

          <div className="bg-background border border-border rounded-xl p-5 mb-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="text-5xl">{selectedProduct.emoji || '☕'}</div>

              <div>
                <div className="text-xl font-medium">{selectedProduct.name}</div>

                <div className="text-xs text-muted-foreground">
                  ₹{selectedProduct.price.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">
                Choose Flavor
              </div>

              <div className="flex gap-2 flex-wrap">
                {flavors.map(f => (
                  <button
                    key={f.id}
                    onClick={() =>
                      setSelectedFlavor(prev => (prev?.id === f.id ? null : f))
                    }
                    className={`px-3 py-2 border rounded-full text-sm transition ${selectedFlavor === f
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-background border-border hover:border-muted'
                      }`}
                  >
                    <div
                      className={`text-s mb-2 ${selectedFlavor?.id === f.id ? 'text-background' : 'text-foreground'}`}
                    >
                      {f.name}
                    </div>
                    <div className="text-s text-muted-foreground mb-2">₹{f.price}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">
                Quantity
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-3 py-2 border border-border rounded hover:bg-secondary cursor-pointer"
                >
                  −
                </button>

                <div className="w-10 text-center font-medium">{quantity}</div>

                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="px-3 py-2 border border-border rounded hover:bg-secondary cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={addBuiltToCart}
              className="w-full bg-foreground text-background py-3 rounded-lg font-medium hover:opacity-90 transition cursor-pointer mb-3"
            >
              Add to Cart
            </button>

            <button
              onClick={() => {
                setView('order');
                clearBuilderState();
              }}
              className="w-full border border-border py-3 rounded-lg font-medium hover:bg-secondary transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full bg-background flex flex-col">
      <div className="max-w-6xl mx-auto w-full py-6 px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl sm:text-5xl tracking-tight mb-1">SIP</h1>
          <p className="text-sm text-muted-foreground italic">Make Drink your Own Way</p>
        </div>

        <div className="flex flex-col gap-6 flex-1 overflow-hidden lg:flex-row">
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
            <h3 className="text-sm font-serif mb-4">Menu</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mb-4">
              {baseDrinks.map(item => (
                <div
                  key={item.id}
                  onClick={() => selectProductForBuilder(item)}
                  className="bg-background border border-border rounded-xl p-4 cursor-pointer hover:border-muted hover:bg-secondary transition"
                >
                  <div className="text-2xl mb-1">{item.emoji || '☕'}</div>

                  <div className="text-sm font-medium mb-1">{item.name}</div>

                  <div className="text-xs text-muted-foreground mb-2">
                    ₹{item.price.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {availableAddOns.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">
                  Add-ons
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {availableAddOns.map(addOn => (
                    <button
                      key={addOn.id}
                      onClick={() => addAddonToCart(addOn)}
                      className="bg-background border border-border rounded-xl p-4 text-left cursor-pointer hover:border-muted hover:bg-secondary transition"
                    >
                      <div className="text-2xl mb-1">✨</div>

                      <div className="text-sm font-medium mb-1">{addOn.name}</div>

                      <div className="text-xs text-muted-foreground mb-2">
                        ₹{addOn.price.toFixed(2)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="w-full lg:w-80 flex flex-col bg-background border border-border rounded-xl p-5 overflow-hidden flex-shrink-0">
            <h3 className="font-serif text-lg mb-4">Order</h3>

            <div className="flex-1 overflow-y-auto mb-4 space-y-3">
              {cart.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center">
                  <div>
                    <div className="text-3xl mb-2">🛒</div>

                    <p className="text-xs text-muted-foreground">Cart empty</p>
                  </div>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.cartItemId} className="bg-secondary border border-border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-sm">{item.name}</h4>

                      <span className="font-medium text-sm">
                        ₹{((item.price + (item.flavorprice ?? 0)) * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    {item.special && (
                      <div className="text-accent-dark font-medium mb-2 text-xs">
                        {item.special}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => removeFromCart(item.cartItemId)}
                        className="text-xs text-muted-foreground hover:text-red-600 font-normal cursor-pointer"
                      >
                        Remove
                      </button>

                      <button
                        onClick={() =>
                          setCart(prev => {
                            const target = prev.find(ci => ci.cartItemId === item.cartItemId);
                            if (!target) return prev;
                            if (target.quantity <= 1) {
                              return prev.filter(ci => ci.cartItemId !== item.cartItemId);
                            }
                            return prev.map(ci =>
                              ci.cartItemId === item.cartItemId
                                ? { ...ci, quantity: ci.quantity - 1 }
                                : ci
                            );
                          })
                        }
                        className="px-3 py-2 border border-border rounded ml-auto hover:bg-secondary cursor-pointer"
                      >
                        −
                      </button>

                      <div className="w-8 text-center ml-auto font-medium">{item.quantity}</div>

                      <button
                        onClick={() =>
                          setCart(prev =>
                            prev.map(ci =>
                              ci.cartItemId === item.cartItemId
                                ? { ...ci, quantity: ci.quantity + 1 }
                                : ci
                            )
                          )
                        }
                        className="px-3 py-2 border border-border rounded ml-auto hover:bg-secondary cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <>
                <div className="mb-3">
                  <label className="text-xs text-muted-foreground">Table Number (optional)</label>
                  <select
                    value={selectedTableNumber}
                    onChange={e => setSelectedTableNumber(e.target.value)}
                    className="mt-1 w-full border border-border rounded px-3 py-2 bg-background"
                  >
                    <option value="">No table selected</option>
                    {tables.map(table => (
                      <option key={table.id} value={table.table_number}>
                        Table {table.table_number}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-secondary rounded-lg p-3 mb-4 space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subtotal</span>

                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between font-medium pt-2 border-t border-border">
                    <span>Total</span>

                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="text-xs text-muted-foreground">Name</label>
                  <input
                    value={customerName}
                    required
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="Your name"
                    className="mt-1 w-full border border-border rounded px-3 py-2 bg-background"
                  />
                </div>

                <button
                  onClick={submitOrder}
                  className="w-full bg-foreground text-background py-3 rounded-lg font-medium hover:opacity-90 transition cursor-pointer"
                >
                  Submit Order
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}