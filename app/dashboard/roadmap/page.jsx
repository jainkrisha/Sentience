"use client";
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { LoaderCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function RoadmapPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const fetchRoadmap = async () => {
    try {
      const res = await fetch('/api/roadmap');
      const data = await res.json();
      if (data.items) {
        setItems(data.items);
      }
    } catch (error) {
      toast.error('Failed to load roadmap');
    }
    setLoading(false);
  };

  const markImproved = async (id) => {
    try {
      const res = await fetch('/api/roadmap', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'improved' })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Marked as improved!');
        setItems(items.filter(item => item.id !== id));
      } else {
        toast.error('Failed to update item');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  return (
    <div className="p-10">
      <h2 className="text-3xl font-bold mb-6">Improvement Roadmap</h2>
      <p className="text-gray-500 mb-8">This is your dynamic to-do list generated from your mock interview feedback.</p>

      {loading ? (
        <LoaderCircle className="animate-spin text-primary" />
      ) : items.length === 0 ? (
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <p className="text-gray-500">Your roadmap is empty! Take a mock interview to get personalized improvement areas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="border rounded-lg p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                  {item.category}
                </span>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded ${
                  item.priority === 'High' ? 'bg-red-100 text-red-800' :
                  item.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {item.priority} Priority
                </span>
              </div>
              <h3 className="text-lg font-bold mt-2">{item.topic}</h3>
              <p className="text-sm text-gray-600 mt-2 mb-4 line-clamp-3">{item.description}</p>
              
              {item.companyTag && (
                <p className="text-xs text-gray-500 mb-4">Target: <strong>{item.companyTag}</strong></p>
              )}

              <Button 
                variant="outline" 
                className="w-full mt-auto" 
                onClick={() => markImproved(item.id)}
              >
                <CheckCircle className="w-4 h-4 mr-2" /> Mark as Improved
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
