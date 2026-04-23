import React, { useState } from 'react';
import { useUnifiedData } from '../../contexts/UnifiedDataContext';
import { COLLECTIONS } from '../../types/index';
import { formatDate } from '../../lib/utils';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';

const ServiceMaster: React.FC = () => {
  const { 
    services,
    customers,
    products,
    addItem,
    updateItem,
    deleteItem,
    loading,
    stats,
    refreshData  // Add refreshData function
  } = useUnifiedData();
  
  const [formData, setFormData] = useState({
    id: '',
    customer_id: '',
    product_id: '',
    service_date: new Date().toISOString().split('T')[0],
    service_type: 'Regular',
    service_status: 'Completed',
    service_notes: '',
    next_service_date: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [operationLoading, setOperationLoading] = useState(false);
  
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsSubmitting(true);
    
    try {
      if (!formData.customer_id || !formData.product_id || !formData.service_date) {
        setMessage({ type: 'error', text: 'Please fill all required fields' });
        setIsSubmitting(false);
        return;
      }
      
      let result;
      
      if (isEditing) {
        result = await updateItem(COLLECTIONS.SERVICES, formData.id, {
          customer_id: formData.customer_id,
          product_id: formData.product_id,
          service_date: formData.service_date,
          service_type: formData.service_type,
          service_status: formData.service_status,
          service_notes: formData.service_notes,
          next_service_date: formData.next_service_date
        });
      } else {
        result = await addItem(COLLECTIONS.SERVICES, {
          customer_id: formData.customer_id,
          product_id: formData.product_id,
          service_date: formData.service_date,
          service_type: formData.service_type,
          service_status: formData.service_status,
          service_notes: formData.service_notes,
          next_service_date: formData.next_service_date,
          created_at: new Date().toISOString()
        });
      }
      
      if (result.success) {
        // Refresh data after successful operation
        await refreshData();
        
        setMessage({ 
          type: 'success', 
          text: isEditing ? 'Service record updated successfully!' : 'Service record added successfully!' 
        });
        setTimeout(() => setMessage(null), 3000);
        
        resetForm();
      } else {
        setMessage({ type: 'error', text: `Error: ${result.error}` });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: `Error: ${error.message}` });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEdit = (service: any) => {
    setFormData({
      id: service.id,
      customer_id: service.customer_id,
      product_id: service.product_id,
      service_date: service.service_date,
      service_type: service.service_type,
      service_status: service.service_status,
      service_notes: service.service_notes || '',
      next_service_date: service.next_service_date || ''
    });
    setIsEditing(true);
  };
  
  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this service record?')) {
      setDeletingId(id);
      setOperationLoading(true);
      setMessage(null);
      
      try {
        const result = await deleteItem(COLLECTIONS.SERVICES, id);
        
        if (result.success) {
          // Refresh data after deletion
          await refreshData();
          
          setMessage({ type: 'success', text: 'Service record deleted successfully!' });
          setTimeout(() => setMessage(null), 3000);
        } else {
          setMessage({ type: 'error', text: `Error: ${result.error}` });
          setTimeout(() => setMessage(null), 3000);
        }
      } catch (error: any) {
        setMessage({ type: 'error', text: `Error: ${error.message}` });
        setTimeout(() => setMessage(null), 3000);
      } finally {
        setDeletingId(null);
        setOperationLoading(false);
      }
    }
  };
  
  const resetForm = () => {
    setFormData({
      id: '',
      customer_id: '',
      product_id: '',
      service_date: new Date().toISOString().split('T')[0],
      service_type: 'Regular',
      service_status: 'Completed',
      service_notes: '',
      next_service_date: ''
    });
    setIsEditing(false);
    setMessage(null);
  };
  
  // Show loading only on initial load, not during refresh operations
  if (loading && services.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading service data...</p>
      </div>
    );
  }
  
  const customerOptions = customers.map(c => ({ 
    value: c.id, 
    label: `${c.first_name} ${c.last_name} (${c.vehicle_number})` 
  }));
  
  const productOptions = products.map(p => ({ 
    value: p.id, 
    label: `${p.product_name} (${p.product_type})` 
  }));
  
  const serviceTypeOptions = [
    { value: 'Regular', label: 'Regular' },
    { value: 'Warranty', label: 'Warranty' },
    { value: 'Complaint', label: 'Complaint' },
    { value: 'Emergency', label: 'Emergency' },
  ];
  
  const serviceStatusOptions = [
    { value: 'Completed', label: 'Completed' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Cancelled', label: 'Cancelled' },
  ];
  
  return (
    <div className="space-y-6 px-4 md:px-0">
      <h1 className="text-xl md:text-3xl font-bold text-gray-800">Service Master</h1>
      
      {message && (
        <div className={`p-3 rounded-lg ${
          message.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
        }`}>
          {message.text}
        </div>
      )}
      
      <Card title={isEditing ? 'Edit Service Record' : 'Add New Service Record'}>
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select 
            label="Customer" 
            name="customer_id" 
            value={formData.customer_id} 
            onChange={(e) => setFormData({...formData, [e.target.name]: e.target.value})} 
            options={customerOptions} 
            required 
            disabled={isSubmitting || operationLoading}
          />
          <Select 
            label="Product" 
            name="product_id" 
            value={formData.product_id} 
            onChange={(e) => setFormData({...formData, [e.target.name]: e.target.value})} 
            options={productOptions} 
            required 
            disabled={isSubmitting || operationLoading}
          />
          <Input 
            label="Service Date" 
            name="service_date" 
            value={formData.service_date} 
            onChange={(e) => setFormData({...formData, [e.target.name]: e.target.value})} 
            required 
            type="date" 
            disabled={isSubmitting || operationLoading}
          />
          <Select 
            label="Service Type" 
            name="service_type" 
            value={formData.service_type} 
            onChange={(e) => setFormData({...formData, [e.target.name]: e.target.value})} 
            options={serviceTypeOptions} 
            required 
            disabled={isSubmitting || operationLoading}
          />
          <Select 
            label="Service Status" 
            name="service_status" 
            value={formData.service_status} 
            onChange={(e) => setFormData({...formData, [e.target.name]: e.target.value})} 
            options={serviceStatusOptions} 
            required 
            disabled={isSubmitting || operationLoading}
          />
          <Input 
            label="Next Service Date" 
            name="next_service_date" 
            value={formData.next_service_date} 
            onChange={(e) => setFormData({...formData, [e.target.name]: e.target.value})} 
            type="date" 
            disabled={isSubmitting || operationLoading}
          />
          <div className="md:col-span-3">
            <Input 
              label="Service Notes" 
              name="service_notes" 
              value={formData.service_notes} 
              onChange={(e) => setFormData({...formData, [e.target.name]: e.target.value})} 
              disabled={isSubmitting || operationLoading}
            />
          </div>
          
          <div className="md:col-span-3 flex justify-end space-x-3">
            <Button 
              type="submit" 
              color="green"
              disabled={isSubmitting || operationLoading}
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                  {isEditing ? 'Updating...' : 'Recording...'}
                </>
              ) : isEditing ? 'Update Service' : 'Record Service'}
            </Button>
            <Button 
              type="button" 
              onClick={resetForm} 
              color="gray"
              disabled={isSubmitting || operationLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
      
      <Card title="Service History">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {services.map(service => (
                <tr key={service.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(service.service_date)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {service.customer_name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {service.product_name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {service.service_type}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      service.service_status === 'Completed' ? 'bg-green-100 text-green-800' :
                      service.service_status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {service.service_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(service)}
                        disabled={deletingId === service.id || operationLoading || isSubmitting}
                        className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        disabled={deletingId === service.id || operationLoading || isSubmitting}
                        className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingId === service.id ? (
                          <span className="inline-flex items-center">
                            <span className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-red-600 mr-1"></span>
                            Deleting...
                          </span>
                        ) : (
                          'Delete'
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {services.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No service records found. Add your first service record above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ServiceMaster;
