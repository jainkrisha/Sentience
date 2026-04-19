"use client";
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function CompanySelector({ selectedCompanies, setSelectedCompanies, onModeChange }) {
  const [companies, setCompanies] = useState([]);
  const [newCompany, setNewCompany] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await fetch('/api/companies');
      const data = await res.json();
      if (data.companies) {
        setCompanies(data.companies);
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const addCompany = async () => {
    if (!newCompany.trim()) return;
    try {
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName: newCompany })
      });
      const data = await res.json();
      if (data.success) {
        setCompanies([...companies, data.company]);
        setNewCompany('');
        toast.success('Company added');
      }
    } catch (error) {
      toast.error('Failed to add company');
    }
  };

  const toggleCompanySelection = (companyName) => {
    const updated = selectedCompanies.includes(companyName)
      ? selectedCompanies.filter(c => c !== companyName)
      : [...selectedCompanies, companyName];
    setSelectedCompanies(updated);
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2">Target Companies (Optional)</h3>
      <p className="text-sm text-gray-500 mb-4">Select companies to tailor your interview questions.</p>
      
      <div className="flex gap-2 mb-4">
        <Input 
          placeholder="Add a new company (e.g. Google, Amazon)" 
          value={newCompany}
          onChange={(e) => setNewCompany(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addCompany()}
        />
        <Button onClick={addCompany} type="button" variant="outline">Add</Button>
      </div>

      {!loading && companies.length > 0 && (
        <div className="flex flex-wrap gap-4 mb-4 bg-gray-50 p-4 rounded-md">
          {companies.map((c) => (
            <div key={c.id} className="flex items-center space-x-2">
              <input 
                type="checkbox"
                id={`company-${c.id}`} 
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                checked={selectedCompanies.includes(c.companyName)}
                onChange={() => toggleCompanySelection(c.companyName)}
              />
              <label htmlFor={`company-${c.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {c.companyName}
              </label>
            </div>
          ))}
        </div>
      )}
      
      {selectedCompanies.length > 0 && (
        <div className="mt-4">
          <label className="text-sm font-semibold mb-2 block">Interview Mode</label>
          <select 
            className="w-full border rounded-md p-2" 
            onChange={(e) => onModeChange(e.target.value)}
            defaultValue="company-specific"
          >
            <option value="company-specific">Company-Specific (Focus strictly on selected companies)</option>
            <option value="combined">Combined (General + Company Focus)</option>
          </select>
        </div>
      )}
    </div>
  );
}
