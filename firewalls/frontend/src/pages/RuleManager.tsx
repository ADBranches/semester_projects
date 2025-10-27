/**
 * RuleManager.tsx
 * Displays and manages all firewall rules
 * Author: Edwin Bwambale
 */

import React, { useEffect, useState } from "react";
import { useRule } from "../context/RuleContext";
import RuleEditor from "../components/RuleEditor";
import type { FirewallRule } from "../types";

const RuleManager: React.FC = () => {
  const { rules, fetchRules, deleteRule, addRule, updateRule, loading, error } = useRule();
  const [selectedRule, setSelectedRule] = useState<FirewallRule | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const handleEdit = (rule: FirewallRule) => {
    setSelectedRule(rule);
    setShowEditor(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this rule?")) {
      await deleteRule(id);
    }
  };

  const handleCreate = () => {
    setSelectedRule(null);
    setShowEditor(true);
  };

  return (
    <div className="p-6 text-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-400">Firewall Rules</h2>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white font-medium"
        >
          + New Rule
        </button>
      </div>

      {loading && <p className="text-gray-400">Loading rules...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-[#101522] rounded-lg border border-gray-700">
          <thead className="bg-gray-800 text-gray-300 text-sm">
            <tr>
              <th className="py-3 px-4 text-left">ID</th>
              <th className="py-3 px-4 text-left">Source IP</th>
              <th className="py-3 px-4 text-left">Destination IP</th>
              <th className="py-3 px-4 text-left">Port</th>
              <th className="py-3 px-4 text-left">Protocol</th>
              <th className="py-3 px-4 text-left">Action</th>
              <th className="py-3 px-4 text-center">Manage</th>
            </tr>
          </thead>

          <tbody>
            {rules.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-500">
                  No rules found.
                </td>
              </tr>
            ) : (
              rules.map((rule) => (
                <tr
                  key={rule.id}
                  className="border-t border-gray-700 hover:bg-gray-800 transition-colors"
                >
                  <td className="py-2 px-4">{rule.id}</td>
                  <td className="py-2 px-4">{rule.src_ip}</td>
                  <td className="py-2 px-4">{rule.dest_ip}</td>
                  <td className="py-2 px-4">{rule.port}</td>
                  <td className="py-2 px-4">{rule.protocol}</td>
                  <td
                    className={`py-2 px-4 font-semibold ${
                      rule.action === "allow" ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {rule.action}
                  </td>
                  <td className="py-2 px-4 text-center space-x-3">
                    <button
                      onClick={() => handleEdit(rule)}
                      className="text-blue-400 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(rule.id!)}
                      className="text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showEditor && (
        <RuleEditor
          rule={selectedRule}
          onSave={async (data) => {
            if (selectedRule) await updateRule(selectedRule.id!, data);
            else await addRule(data);
            setShowEditor(false);
          }}
          onCancel={() => setShowEditor(false)}
        />
      )}
    </div>
  );
};

export default RuleManager;
