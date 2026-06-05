'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2, Edit2, Plus } from 'lucide-react';

interface Flavor {
  id: string;
  name: string;
  price: number;
  description: string;
  is_available: boolean;
  basedrinks?: {
    basedrink: BaseDrink;
  }[];
}

interface BaseDrink {
  id: string;
  name: string;
}

export const FlavorManagement: React.FC = () => {
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [basedrinks, setBaseDrinks] = useState<BaseDrink[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingFlavor, setEditingFlavor] =
    useState<Flavor | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    is_available: true,
    basedrinksIds: [] as string[],
  });

  useEffect(() => {
    fetchFlavors();
    fetchBaseDrinks();
  }, []);

  const fetchFlavors = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/flavor/adminget`, { withCredentials: true, });

      setFlavors(res.data);
    } catch (error) {
      console.error('Failed to fetch flavors:', error);
    }
  };

  const fetchBaseDrinks = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/basedrink/adminget`, { withCredentials: true, });

      setBaseDrinks(res.data);
    } catch (error) {
      console.error('Failed to fetch Base Drinks:', error);
    }
  }

  const openModal = (flavor?: Flavor) => {
    if (flavor) {
      setEditingFlavor(flavor);

      setFormData({
        name: flavor.name,
        price: flavor.price.toString(),
        description: flavor.description,
        is_available: flavor.is_available,
        basedrinksIds: flavor.basedrinks?.map(
          (b: any) => b.basedrink.id
        ) || [],
      });
    } else {
      setEditingFlavor(null);

      setFormData({
        name: '',
        price: '',
        description: '',
        is_available: true,
        basedrinksIds: [],
      });
    }

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingFlavor(null);
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!formData.name) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      if (editingFlavor) {
        await axios.put(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/flavor/update/${editingFlavor.id}`,
          {
            name: formData.name,
            price: parseInt(formData.price),
            description: formData.description,
            is_available: formData.is_available,
            basedrinksIds: formData.basedrinksIds,
          }, {
          withCredentials: true,
        }
        );
      } else {
        await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/flavor/create`, {
          name: formData.name,
          price: parseInt(formData.price),
          description: formData.description,
          is_available: formData.is_available,
          basedrinksIds: formData.basedrinksIds,
        },
          {
            withCredentials: true,
          });
      }

      await fetchFlavors();

      closeModal();
    } catch (error) {
      console.error('Failed to save flavor:', error);
      alert('Something went wrong');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this flavor? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/flavor/delete/${id}`, {withCredentials: true});

      await fetchFlavors();
    } catch (error) {
      console.error('Failed to delete flavor:', error);
      alert('Something went wrong');
    }
  };

  return (
    <div className="space-y-6 min-h-screen">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">
          Flavor Management
        </h2>

        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition"
        >
          <Plus size={18} />
          Add Flavor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {flavors.map(flavor => (
          <div
            key={flavor.id}
            className="bg-white rounded-lg p-4 border border-border shadow-sm"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-foreground">
                  {flavor.name}
                </h3>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openModal(flavor)}
                  className="p-2 hover:bg-muted rounded transition"
                  title="Edit"
                >
                  <Edit2
                    size={16}
                    className="text-accent"
                  />
                </button>

                <button
                  onClick={() => handleDelete(flavor.id)}
                  className="p-2 hover:bg-muted rounded transition"
                  title="Delete"
                >
                  <Trash2
                    size={16}
                    className="text-destructive"
                  />
                </button>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-3">
              {flavor.price}
            </p>

            <p className="text-sm text-muted-foreground mb-3">
              {flavor.description}
            </p>

            <div className="flex items-center justify-end">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${flavor.is_available
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
                  }`}
              >
                {flavor.is_available
                  ? 'Available'
                  : 'Unavailable'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-lg">
            <h3 className="text-xl font-bold text-foreground mb-4">
              {editingFlavor
                ? 'Edit Flavor'
                : 'Add New Flavor'}
            </h3>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Flavor Name *
                </label>

                <input
                  type="text"
                  value={formData.name}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="e.g., Vanilla, Chocolate"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Price ($) *
                </label>

                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      price: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Description
                </label>

                <textarea
                  value={formData.description}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Flavor description"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Base Drinks
                </label>

                <select
                  multiple
                  value={formData.basedrinksIds}
                  onChange={(e) => {
                    const values = Array.from(
                      e.target.selectedOptions,
                      option => option.value
                    );

                    setFormData({
                      ...formData,
                      basedrinksIds: values,
                    });
                  }}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent min-h-[120px]"
                >
                  {basedrinks.map((basedrink) => (
                    <option
                      key={basedrink.id}
                      value={basedrink.id}
                    >
                      {basedrink.name}
                    </option>
                  ))}
                </select>

                <p className="text-xs text-muted-foreground mt-1">
                  Hold Ctrl/Cmd to select multiple Base Drinks
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_available}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        is_available: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded border-border accent-accent"
                  />

                  <span className="text-sm font-medium text-foreground">
                    Available
                  </span>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-accent text-white rounded-lg hover:bg-opacity-90 transition font-medium"
                >
                  {editingFlavor ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
