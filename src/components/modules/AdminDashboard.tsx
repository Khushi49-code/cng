import React, { useState } from "react";
import { useUnifiedData } from "../../contexts/UnifiedDataContext";
import { COLLECTIONS } from "../../types";
import { formatDate } from "../../lib/utils";
import Card from "../common/Card";
import Button from "../common/Button";

const AdminDashboard: React.FC = () => {
  const { reminders, stats, meta, updateItem, loading } = useUnifiedData();

  const [filterDays, setFilterDays] = useState<number>(30);

  const handleSendReminder = async (mappingId: string, customerName: string) => {
    if (window.confirm(`Send reminder to ${customerName}?`)) {
      const result = await updateItem(COLLECTIONS.MAPPINGS, mappingId, {
        "reminder_status.renewal_sent": true,
        updated_at: new Date().toISOString(),
      });

      if (result.success) {
        alert(`Reminder sent to ${customerName}`);
      } else {
        alert("Error sending reminder");
      }
    }
  };

  // ✅ Loading Skeleton
  if (loading) {
    return (
      <div className="space-y-6 px-4 md:px-0">
        <h1 className="text-xl md:text-3xl font-bold text-gray-800">
          Admin Dashboard
        </h1>

        {/* Skeleton Loader */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-xl shadow-lg animate-pulse"
            >
              <div className="h-8 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-12 bg-gray-100 rounded animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const filteredReminders = reminders.filter(
    (reminder) => reminder.days_until_expiry <= filterDays
  );

  return (
    <div className="space-y-6 px-4 md:px-0">
      <h1 className="text-xl md:text-3xl font-bold text-gray-800">
        Admin Dashboard
      </h1>

      {!meta.isOnline && (
        <div className="p-4 bg-yellow-100 text-yellow-800 rounded-lg border border-yellow-300">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>You are offline. Showing cached data.</span>
          </div>
        </div>
      )}

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
            {stats.expiringThisWeek}
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

      <Card title="Warranty Expiry Reminders">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            Reminders for next {filterDays} days
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
          </div>
        </div>

        {filteredReminders.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No warranties expiring in the next {filterDays} days
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Expiry Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Days Left
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReminders.map((reminder) => (
                  <tr key={reminder.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div>{reminder.customer_name}</div>
                      <div className="text-xs text-gray-500">
                        {reminder.vehicle_number}
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      {reminder.product_name}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatDate(reminder.expiry_date)}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          reminder.days_until_expiry <= 1
                            ? "bg-red-100 text-red-800"
                            : reminder.days_until_expiry <= 7
                            ? "bg-orange-100 text-orange-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {reminder.days_until_expiry} days
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      {reminder.reminder_to_send ? (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Reminder due
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                          Monitoring
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <Button
                        onClick={() =>
                          handleSendReminder(reminder.id, reminder.customer_name)
                        }
                        color="blue"
                        className="text-xs py-1 px-2"
                        disabled={!meta.isOnline}
                      >
                        {meta.isOnline ? "Send Reminder" : "Offline"}
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
