import React, { useState } from "react";
import { useUnifiedData } from "../../contexts/UnifiedDataContext";
import { formatDate } from "../../lib/utils";
import Card from "../common/Card";
import Button from "../common/Button";
import { ReminderView } from "../../types";

// Directly define COLLECTIONS to avoid import issues
const COLLECTIONS = {
  CUSTOMERS: 'customers',
  PRODUCTS: 'products',
  MAPPINGS: 'mappings',
  SERVICES: 'services',
  LOGS: 'logs'
} as const;

const AdminDashboard: React.FC = () => {
  const { reminders, stats, meta, updateItem, loading, refreshData } = useUnifiedData();

  const [filterDays, setFilterDays] = useState<number>(30);

  const handleSendReminder = async (assignmentId: string, customerName: string) => {
    if (window.confirm(`Send reminder to ${customerName}? This will mark renewal reminder as sent.`)) {
      const result = await updateItem(COLLECTIONS.MAPPINGS, assignmentId, {
        "reminder_status.renewal_sent": true,
        updated_at: new Date().toISOString()
      });

      if (result.success) {
        alert(`✅ Reminder sent to ${customerName}`);
        await refreshData();
      } else {
        alert(`❌ Error sending reminder: ${result.error}`);
      }
    }
  };

  // Loading Skeleton - only show on initial load
  if (loading && reminders.length === 0) {
    return (
      <div className="space-y-6 px-4 md:px-0">
        <h1 className="text-xl md:text-3xl font-bold text-gray-800">
          Admin Dashboard
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-lg animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
            </div>
          ))}
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Filter reminders - only show non-renewed and within days limit
  const filteredReminders: ReminderView[] = reminders.filter(
    (reminder: ReminderView) => reminder.days_until_expiry <= filterDays && !reminder.warranty_renewed
  );

  // Sort by urgency (days left ascending)
  const sortedReminders: ReminderView[] = [...filteredReminders].sort((a: ReminderView, b: ReminderView) => a.days_until_expiry - b.days_until_expiry);

  return (
    <div className="space-y-6 px-4 md:px-0">
      <h1 className="text-xl md:text-3xl font-bold text-gray-800">
        Admin Dashboard
      </h1>

      {/* Offline Indicator */}
      {!meta.isOnline && (
        <div className="p-4 bg-yellow-100 text-yellow-800 rounded-lg border border-yellow-300">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>You are offline. Showing cached data.</span>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-600">
            {stats.totalCustomers}
          </div>
          <div className="text-gray-600">Total Customers</div>
        </Card>

        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600">
            {stats.totalAssignments}
          </div>
          <div className="text-gray-600">Active Warranties</div>
        </Card>

        <Card className="text-center">
          <div className="text-3xl font-bold text-red-600">
            {stats.expiringThisWeek || 0}
          </div>
          <div className="text-gray-600">Expiring This Week</div>
        </Card>

        <Card className="text-center">
          <div className="text-3xl font-bold text-purple-600">
            {stats.pendingServices}
          </div>
          <div className="text-gray-600">Pending Services</div>
        </Card>
      </div>

      {/* Reminders Table */}
      <Card title="Warranty Expiry Reminders">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <h3 className="text-lg font-semibold">
            Reminders for next {filterDays} days
            <span className="ml-2 text-sm text-gray-500">
              ({sortedReminders.length} reminders)
            </span>
          </h3>

          <div className="flex space-x-2">
            <Button
              onClick={() => setFilterDays(7)}
              color={filterDays === 7 ? "blue" : "gray"}
              className="text-xs"
            >
              7 Days
            </Button>
            <Button
              onClick={() => setFilterDays(15)}
              color={filterDays === 15 ? "blue" : "gray"}
              className="text-xs"
            >
              15 Days
            </Button>
            <Button
              onClick={() => setFilterDays(30)}
              color={filterDays === 30 ? "blue" : "gray"}
              className="text-xs"
            >
              30 Days
            </Button>
            <Button
              onClick={() => setFilterDays(60)}
              color={filterDays === 60 ? "blue" : "gray"}
              className="text-xs"
            >
              60 Days
            </Button>
          </div>
        </div>

        {sortedReminders.length === 0 ? (
          <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
            <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>No warranties expiring in the next {filterDays} days</p>
            <p className="text-sm mt-1">All warranties are active or already renewed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiry Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days Left
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedReminders.map((reminder: ReminderView) => (
                  <tr key={reminder.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{reminder.customer_name}</div>
                      <div className="text-xs text-gray-500">
                        {reminder.vehicle_number} | {reminder.mobile_number}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {reminder.product_name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(reminder.expiry_date)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          reminder.days_until_expiry <= 0
                            ? "bg-red-100 text-red-800"
                            : reminder.days_until_expiry <= 7
                            ? "bg-orange-100 text-orange-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {reminder.days_until_expiry <= 0 ? "Expired" : `${reminder.days_until_expiry} days`}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {reminder.warranty_renewed ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ Renewed
                        </span>
                      ) : reminder.renewal_sent ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Reminder Sent
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Button
                        onClick={() =>
                          handleSendReminder(reminder.assignment_id, reminder.customer_name)
                        }
                        color="blue"
                        className="text-xs py-1 px-2"
                        disabled={!meta.isOnline || reminder.warranty_renewed || reminder.renewal_sent}
                      >
                        {reminder.warranty_renewed ? "Renewed" : 
                         reminder.renewal_sent ? "Sent" : 
                         !meta.isOnline ? "Offline" : "Send Reminder"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminDashboard;
