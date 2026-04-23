import React, { useState } from 'react';
import { useUnifiedData } from '../../contexts/UnifiedDataContext';
import { COLLECTIONS } from '../../types';
import { formatDate } from '../../lib/utils';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';

const CustomerManagement: React.FC = () => {
  const { 
    customers,
    deleteItem,
    findCustomer,
    getCustomerProducts,
    getCustomerServices,
    loading,
    stats,
    refreshData  // Add refreshData function
  } = useUnifiedData();
  
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedCustomerName, setSelectedCustomerName] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [operationLoading, setOperationLoading] = useState(false);
  
  const handleViewDetails = (customer: any) => {
    setSelectedCustomerId(customer.id);
    setSelectedCustomerName(`${customer.first_name} ${customer.last_name}`);
  };
  
  const handleDeleteCustomer = async (id: string, name: string) => {
    if (window.confirm(`Delete customer ${name}? This will also delete all related assignments and services!`)) {
      setDeletingId(id);
      setOperationLoading(true);
      setMessage(null);

      try {
        const result = await deleteItem(COLLECTIONS.CUSTOMERS, id);
        
        if (result.success) {
          // Refresh data after deletion
          await refreshData();
          
          setMessage({ type: 'success', text: `Customer ${name} deleted successfully!` });
          setTimeout(() => setMessage(null), 3000);
          
          // Close details modal if the deleted customer was selected
          if (selectedCustomerId === id) {
            setSelectedCustomerId(null);
            setSelectedCustomerName('');
          }
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
  
  // Show loading only on initial load, not during refresh operations
  if (loading && customers.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading customer data...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 px-4 md:px-0">
      <h1 className="text-xl md:text-3xl font-bold text-gray-800">Customer Management</h1>
      
      {message && (
        <div className={`p-3 rounded-lg ${
          message.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
        }`}>
          {message.text}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-600">{stats.totalCustomers}</div>
          <div className="text-gray-600">Total Customers</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600">{stats.totalAssignments}</div>
          <div className="text-gray-600">Active Assignments</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-purple-600">{stats.totalServices}</div>
          <div className="text-gray-600">Service Records</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-orange-600">{stats.expiringThisMonth}</div>
          <div className="text-gray-600">Expiring This Month</div>
        </Card>
      </div>
      
      <Card title="Customer List">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Services</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.map(customer => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {customer.first_name} {customer.last_name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{customer.mobile_number}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {customer.vehicle_number} ({customer.vehicle_model})
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {customer.products?.length || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {customer.services?.length || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetails(customer)}
                        disabled={deletingId === customer.id || operationLoading}
                        className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDeleteCustomer(customer.id, customer.first_name)}
                        disabled={deletingId === customer.id || operationLoading}
                        className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingId === customer.id ? (
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
              {customers.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
      {selectedCustomerId && (
        <Card title={`Customer Details: ${selectedCustomerName}`}>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Assigned Products</h3>
                {getCustomerProducts(selectedCustomerId).length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {getCustomerProducts(selectedCustomerId).map(product => (
                      <div key={product.id} className="p-3 border rounded-lg">
                        <div className="font-medium text-sm">{product.product_name}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          Purchase: {formatDate(product.product_purchase_date)} | 
                          Expiry: {formatDate(product.warranty_expiry_date)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No products assigned</p>
                )}
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Service History</h3>
                {getCustomerServices(selectedCustomerId).length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {getCustomerServices(selectedCustomerId).slice(0, 3).map(service => (
                      <div key={service.id} className="p-3 border rounded-lg">
                        <div className="font-medium text-sm">{service.service_type} - {service.service_status}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          Date: {formatDate(service.service_date)} | 
                          Product: {service.product_name}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No service history</p>
                )}
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <button
                onClick={() => setSelectedCustomerId(null)}
                disabled={operationLoading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Close Details
              </button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CustomerManagement;
