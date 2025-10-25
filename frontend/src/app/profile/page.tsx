'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

type Illness = {
  id?: string;
  name: string;
  severity: 'low' | 'medium' | 'high';
  notes: string;
  user_id: string;
};

export default function ProfilePage() {
  const { user } = useAuth();
  const [illnesses, setIllnesses] = useState<Illness[]>([]);
  const [loading, setLoading] = useState(true);
  const [newIllness, setNewIllness] = useState<Omit<Illness, 'id' | 'user_id'>>({ 
    name: '', 
    severity: 'medium', 
    notes: '' 
  });
  const supabase = createClient();

  useEffect(() => {
    if (user) {
      fetchIllnesses();
    }
  }, [user]);

  const fetchIllnesses = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_illnesses')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      
      setIllnesses(data || []);
    } catch (error) {
      console.error('Error fetching illnesses:', error);
      toast.error('Failed to load your health information');
    } finally {
      setLoading(false);
    }
  };

  const handleAddIllness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_illnesses')
        .insert([{ ...newIllness, user_id: user.id }])
        .select();

      if (error) throw error;
      
      setIllnesses([...illnesses, ...(data || [])]);
      setNewIllness({ name: '', severity: 'medium', notes: '' });
      toast.success('Health condition added successfully');
    } catch (error) {
      console.error('Error adding illness:', error);
      toast.error('Failed to add health condition');
    }
  };

  const handleDeleteIllness = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_illnesses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setIllnesses(illnesses.filter(illness => illness.id !== id));
      toast.success('Health condition removed');
    } catch (error) {
      console.error('Error deleting illness:', error);
      toast.error('Failed to remove health condition');
    }
  };

  if (loading && !illnesses.length) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 text-white">
      <h1 className="text-3xl font-bold mb-8 text-white">Your Health Profile</h1>
      
      <Card className="mb-8 bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Add Health Condition</CardTitle>
          <CardDescription className="text-gray-300">
            Add any health conditions that may be affected by air quality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddIllness} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">Condition Name</Label>
                <Input
                  id="name"
                  value={newIllness.name}
                  onChange={(e) => setNewIllness({...newIllness, name: e.target.value})}
                  placeholder="e.g., Asthma, Allergies"
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="severity" className="text-gray-300">Severity</Label>
                <select
                  id="severity"
                  className="flex h-10 w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={newIllness.severity}
                  onChange={(e) => setNewIllness({...newIllness, severity: e.target.value as 'low' | 'medium' | 'high'})}
                  required
                >
                  <option value="low" className="bg-gray-700">Low</option>
                  <option value="medium" className="bg-gray-700">Medium</option>
                  <option value="high" className="bg-gray-700">High</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-gray-300">Notes (Optional)</Label>
              <Input
                id="notes"
                value={newIllness.notes}
                onChange={(e) => setNewIllness({...newIllness, notes: e.target.value})}
                placeholder="Any additional details about your condition"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <Button 
              type="submit" 
              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              Add Condition
            </Button>
          </form>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-semibold mb-4 text-white">Your Health Conditions</h2>
        {illnesses.length === 0 ? (
          <p className="text-gray-400">No health conditions added yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {illnesses.map((illness) => (
              <Card key={illness.id} className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg text-white">{illness.name}</CardTitle>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      illness.severity === 'high' ? 'bg-red-100 text-red-800' :
                      illness.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {illness.severity.charAt(0).toUpperCase() + illness.severity.slice(1)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  {illness.notes && (
                    <p className="text-sm text-gray-300 mb-4">{illness.notes}</p>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => illness.id && handleDeleteIllness(illness.id)}
                    className="text-red-400 border-red-400 hover:bg-red-900/30 hover:text-red-300"
                  >
                    Remove
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
