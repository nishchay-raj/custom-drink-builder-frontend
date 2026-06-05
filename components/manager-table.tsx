'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2, LayoutGrid, Plus, ToggleLeft, ToggleRight } from 'lucide-react';

interface Table {
  id: string;
  table_number: number;
  is_available: boolean;
  is_occupied: boolean;
}

export const ManagerTable: React.FC = () => {
  const [enabled, setEnabled] = useState(false);
  const [tables, setTables] = useState<Table[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [formData, setFormData] = useState({
    table_number: '',
    is_available: true,
  });

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/table/staffget`,
        { withCredentials: true }
      );
      setTables(res.data);
    } catch (error) {
      console.error('Failed to fetch tables:', error);
    }
  };

  const openModal = (table?: Table) => {
    if (table) {
      setEditingTable(table);
      setFormData({
        table_number: table.table_number.toString(),
        is_available: table.is_available,
      });
    } else {
      setEditingTable(null);
      setFormData({
        table_number: '',
        is_available: true,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTable(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.table_number) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      if (editingTable) {
        await axios.put(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/table/update/${editingTable.id}`,
          {
            table_number: parseInt(formData.table_number),
            is_available: formData.is_available,
          },
          { withCredentials: true }
        );
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/table/create`,
          {
            table_number: parseInt(formData.table_number),
            is_available: formData.is_available,
          },
          { withCredentials: true }
        );
      }

      await fetchTables();
      closeModal();
    } catch (error) {
      console.error('Failed to save table:', error);
      alert('Something went wrong');
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this table? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/table/delete/${id}`,
        { withCredentials: true }
      );
      await fetchTables();
    } catch (error) {
      console.error('Failed to delete table:', error);
      alert('Something went wrong');
    }
  };

  const toggleAvailability = async (table: Table) => {
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/table/availability/${table.id}`,
        {
          is_available: !table.is_available,
          is_occupied: false,
        },
        { withCredentials: true }
      );
      await fetchTables();
    } catch (error) {
      console.error('Failed to toggle table availability:', error);
      alert('Something went wrong');
    }
  };

  const toggleOccupancy = async (table: Table) => {
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/table/occupancy/${table.id}`,
        {
          is_occupied: !table.is_occupied,
        },
        { withCredentials: true }
      );
      await fetchTables();
    } catch (error) {
      console.error('Failed to toggle table availability:', error);
      alert('Something went wrong');
    }
  };

  return (
    <div className="space-y-6 min-h-screen">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Table Management</h2>

        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition"
        >
          <Plus size={18} />
          Add Table
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
        {tables.map((table) => (
          <div
            key={table.id}
            className="bg-white rounded-lg p-4 border border-border shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-start justify-between mb-4">

              <div className="flex items-center w-full">
                <div className="flex items-center gap-2">
                  <LayoutGrid size={18} />

                  <label>
                    <span>Table No. {table.table_number}</span>
                  </label>
                </div>

                <button
                  onClick={() => handleDelete(table.id)}
                  className="ml-auto p-2 hover:bg-muted rounded transition"
                  title="Delete"
                >
                  <Trash2 size={20} className="text-destructive" />
                </button>
              </div>
            </div>

            <div className="space-y-3">

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-l text-foreground">Available</span>
                <button
                  onClick={() => {
                    toggleAvailability(table);
                    setEnabled(!enabled);
                  }
                  }
                  className="p-2 hover:bg-muted rounded transition"
                  title="Toggle availability"
                >
                  {table.is_available ? (
                    <ToggleRight size={30} className="text-green-600" />
                  ) : (
                    <ToggleLeft size={30} className="text-gray-400" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className='text-l text-foreground'>
                  {table.is_occupied ? "Occupied" : "Idle"}
                </span>
                <button
                  disabled={enabled}
                  onClick={() => toggleOccupancy(table)}
                  className="p-2 hover:bg-muted rounded transition"
                  title="Toggle occupancy"
                >
                  {table.is_occupied ? (
                    <ToggleRight size={30} className="text-green-600">Occupied</ToggleRight>
                  ) : (
                    <ToggleLeft size={30} className="text-gray-400">Idle</ToggleLeft>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {tables.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No tables found. Create one to get started!</p>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-lg">
            <h3 className="text-xl font-bold text-foreground mb-4">
              {editingTable ? 'Edit Table' : 'Add New Table'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Table Number *
                </label>

                <input
                  type="number"
                  min="1"
                  value={formData.table_number}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      table_number: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="e.g., 1, 2, 3"
                />
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_available}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_available: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded border-border accent-accent"
                  />

                  <span className="text-sm font-medium text-foreground">
                    Available for customers
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
                  {editingTable ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
