'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface WaiterCartItem {
  cartItemId: string;
  id: string;
  name: string;
  price: number;
  flavorprice?: number;
  addonPrices?: number[];
  emoji: string;
  quantity: number;
  special?: string;
}

interface Table {
  id: string;
  table_number: number;
  is_occupied: boolean;
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

type ViewState = 'tables' | 'order' | 'builder';

export default function WaiterInterface() {
  const [tables, setTables] = useState<Table[]>([]);

  const [baseDrinks, setbaseDrinks] = useState<BaseDrink[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [cart, setCart] = useState<WaiterCartItem[]>([]);
  const [view, setView] = useState<ViewState>('tables');

  const [selectedProduct, setSelectedProduct] =
    useState<BaseDrink | null>(null);

  const [selectedFlavor, setSelectedFlavor] =
    useState<Flavor | null>(null);

  const [flavors, setFlavor] = useState<Flavor[]>([]);
  const [availableAddOns, setAvailableAddOns] = useState<Addons[]>([]);
  const [quantity, setQuantity] = useState<number>(1);

  const fetchTables = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/table/userget`);
      setTables(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchDrinks = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/basedrink/userget`);
        setbaseDrinks(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchDrinks();
  }, []);

  useEffect(() => {
    fetchTables();
  }, []);

  useEffect(() => {
    fetchAddons();
  }, []);

  const fetchFlavors = async (productId: string) => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/flavor/userget/${productId}`
      );
      setFlavor(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAddons = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/addon/userget`
      );
      setAvailableAddOns(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const selectTable = (tableId: string) => {
    setSelectedTable(tableId);
    setCart([]);
    setView('order');
    // setSelectedProduct(null);
    setFlavor([]);
    setSelectedFlavor(null);
    setQuantity(1);
  };

  const makeIdle = async (id: string) => {
    if (
      !window.confirm(
        'Are you sure you want to make this table idle? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/table/idle/${id}`,
        {},
        { withCredentials: true }
      );
      await fetchTables();
    } catch (error) {
      console.error('Failed to make table idle:', error);
      alert('Something went wrong');
    }
  };

  const selectProductForBuilder = (product: BaseDrink) => {
    setSelectedProduct(product);
    setFlavor([]);
    setSelectedFlavor(null);
    setQuantity(1);
    setView('builder');
  };

  const addAddonToCart = (addOn: Addons) => {
    setCart(prev => [
      ...prev,
      {
        cartItemId: crypto.randomUUID(),
        id: addOn.id,
        name: addOn.name,
        price: addOn.price,
        emoji: '✨',
        quantity: 1,
      },
    ]);
  };

  const addBuiltToCart = () => {
    if (!selectedProduct) return;

    const specialParts = [selectedFlavor?.name].filter(
      (part): part is string => Boolean(part)
    );

    const special = specialParts.length > 0 ? specialParts.join(', ') : undefined;

    const cartItem: WaiterCartItem = {
      cartItemId: crypto.randomUUID(),
      id: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedProduct.price,
      flavorprice: selectedFlavor?.price,
      emoji: selectedProduct.emoji || '☕',
      quantity,
      special,
    };

    setCart(prev => [...prev, cartItem]);

    setSelectedProduct(null);
    setFlavor([]);
    setSelectedFlavor(null);
    setQuantity(1);
    setView('order');
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev =>
      prev.filter(item => item.cartItemId !== cartItemId)
    );
  };

  const submitOrder = () => {
    if (selectedTable && cart.length > 0) {
      setTables(prev =>
        prev.map(t =>
          t.id === selectedTable
            ? { ...t, occupied: true, itemCount: cart.length }
            : t
        )
      );

      setCart([]);
      setSelectedTable(null);
      setView('tables');
    }
  };

  const subtotal = cart.reduce((sum, item) => {
    const flavor = item.flavorprice ? item.flavorprice : 0;
    const addons = item.addonPrices?.reduce((addonSum, price) => addonSum + price, 0) ?? 0;
    return sum + (item.price + flavor + addons) * item.quantity;
  }, 0);

  if (view === 'tables') {
    return (
      <div className="overflow-y-auto h-full bg-background">
        <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="font-serif text-4xl sm:text-5xl tracking-tight mb-1">
              SIP
            </h1>
            <p className="text-sm text-muted-foreground italic">
              Waiter Management
            </p>
          </div>

          <div className="mb-6">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">
              Select Table
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
              {tables.map(table => (
                <button
                  key={table.id}
                  onClick={() =>
                    table.is_occupied ? makeIdle(table.id) : selectTable(table.id)}
                  className={`
                    h-16 rounded-xl text-sm font-medium flex flex-col items-center justify-center gap-1 transition
                    border cursor-pointer
                    ${table.is_occupied
                      ? 'bg-red-50 border-red-300 text-red-600 opacity-60 cursor-not-allowed'
                      : 'bg-background border-border text-foreground hover:bg-secondary hover:border-muted'
                    }
                  `}
                >
                  <span className="font-bold text-base">
                    T{table.table_number}
                  </span>
                </button>
              ))}
            </div>
          </div>
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
              // setSelectedProduct(null);
              setFlavor([]);
              setQuantity(1);
            }}
            className="text-muted-foreground hover:text-foreground text-sm mb-6 cursor-pointer"
          >
            ← Back
          </button>

          <div className="bg-background border border-border rounded-xl p-5 mb-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="text-5xl">
                {selectedProduct.emoji || '☕'}
              </div>

              <div>
                <div className="text-xl font-medium">
                  {selectedProduct.name}
                </div>

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
                    <div className={`text-s mb-2 ${selectedFlavor === f ? 'text-white' : 'text-foreground'}`}>
                      {f.name}
                    </div>
                    <div className={`text-s mb-2 ${selectedFlavor === f ? 'text-white' : 'text-muted-foreground'}`}>
                      ₹{f.price.toFixed(2)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">
                Quantity
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
                setSelectedProduct(null);
                setFlavor([]);
                setQuantity(1);
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

  const selectedTableObj = tables.find(
    t => t.id === selectedTable
  );

  return (
    <div className="overflow-y-auto h-full bg-background flex flex-col">
      <div className="max-w-6xl mx-auto w-full py-6 px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setView('tables')}
            className="w-9 h-9 rounded-full bg-secondary border border-border flex items-center justify-center cursor-pointer hover:bg-blue-100 transition text-lg"
          >
            ←
          </button>

          <div>
            <h2 className="font-serif text-2xl">
              Table {selectedTableObj?.table_number}
            </h2>

            <p className="text-xs text-muted-foreground">
              Take order
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6 flex-1 overflow-hidden lg:flex-row">
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
            <h3 className="text-sm font-serif mb-4">Menu</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mb-4">
              {baseDrinks.map(item => (
                <div
                  key={item.id}
                  onClick={() => {
                    selectProductForBuilder(item);
                    fetchFlavors(item.id);
                  }}
                  className="bg-background border border-border rounded-xl p-4 cursor-pointer hover:border-muted hover:bg-secondary transition"
                >
                  <div className="text-2xl mb-1">
                    {item.emoji || '☕'}
                  </div>

                  <div className="text-sm font-medium mb-1">
                    {item.name}
                  </div>

                  <div className="text-xs text-muted-foreground mb-2">
                    ₹{item.price.toFixed(2)}
                  </div>

                  {cart.some(
                    cartItem => cartItem.id === item.id
                  ) && (
                      <div className="text-center text-xs font-bold bg-accent text-white rounded-full py-1">
                        ✓ Added
                      </div>
                    )}
                </div>
              ))}
            </div>

            <div className="mb-4">
              <div className="text-sm font-serif mb-4">Add-ons</div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {availableAddOns.map(addOn => (
                  <button
                    key={addOn.id}
                    onClick={() => addAddonToCart(addOn)}
                    className="bg-background border border-border rounded-xl p-4 text-left cursor-pointer hover:border-muted hover:bg-secondary transition"
                  >
                    <div className="text-2xl mb-1">✨</div>

                    <div className="text-sm font-medium mb-1">
                      {addOn.name}
                    </div>

                    <div className="text-xs text-muted-foreground mb-3">
                      ₹{addOn.price.toFixed(2)}
                    </div>

                    <div className="text-xs font-medium text-foreground">
                      Add to Cart
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full lg:w-80 flex flex-col bg-background border border-border rounded-xl p-5 overflow-hidden flex-shrink-0">
            <h3 className="font-serif text-lg mb-4">
              Order
            </h3>

            <div className="flex-1 overflow-y-auto mb-4 space-y-3">
              {cart.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center">
                  <div>
                    <div className="text-3xl mb-2">🛒</div>

                    <p className="text-xs text-muted-foreground">
                      Cart empty
                    </p>
                  </div>
                </div>
              ) : (
                cart.map(item => (
                  <div
                    key={item.cartItemId}
                    className="bg-secondary border border-border rounded-lg p-3"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-sm">
                        {item.name}
                      </h4>

                      <span className="font-medium text-sm">
                        ₹{(
                          (item.price + (item.flavorprice ?? 0) + (item.addonPrices?.reduce((sum, price) => sum + price, 0) ?? 0)) * item.quantity
                        ).toFixed(2)}
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

                      <div className="w-8 text-center ml-auto font-medium">
                        {item.quantity}
                      </div>

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