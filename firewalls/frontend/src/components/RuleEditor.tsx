/**
 * RuleEditor.tsx
 * Modal form for creating or editing firewall rules
 * Author: Edwin Bwambale
 */

import React, { useState, useEffect } from "react";
import { ruleService } from "../services/ruleService";
import type { FirewallRule } from "../types";

interface RuleEditorProps {
  rule: FirewallRule | null;
  onSave: (data: Omit<FirewallRule, "id" | "created_at">) => Promise<void>;
  onCancel: () => void;
}

const RuleEditor: React.FC<RuleEditorProps> = ({ rule, onSave, onCancel }) => {
  const [form, setForm] = useState<Omit<FirewallRule, "id" | "created_at">>({
    src_ip: "",
    dest_ip: "",
    port: 0,
    protocol: "TCP",
    action: "allow",
  });

  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (rule) {
      const { src_ip, dest_ip, port, protocol, action } = rule;
      setForm({ src_ip, dest_ip, port, protocol, action });
    }
  }, [rule]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "port" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = await ruleService.validateRule(form);
    if (validation.length > 0) {
      setErrors(validation);
      return;
    }
    await onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-[#101522] rounded-lg p-6 w-full max-w-md text-gray-200 shadow-xl">
        <h3 className="text-lg font-semibold text-indigo-400 mb-4">
          {rule ? "Edit Firewall Rule" : "Create Firewall Rule"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-400">Source IP</label>
            <input
              type="text"
              name="src_ip"
              value={form.src_ip}
              onChange={handleChange}
              className="w-full mt-1 rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400">Destination IP</label>
            <input
              type="text"
              name="dest_ip"
              value={form.dest_ip}
              onChange={handleChange}
              className="w-full mt-1 rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400">Port</label>
            <input
              type="number"
              name="port"
              value={form.port}
              onChange={handleChange}
              className="w-full mt-1 rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm text-gray-400">Protocol</label>
              <select
                name="protocol"
                value={form.protocol}
                onChange={handleChange}
                className="w-full mt-1 rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-indigo-500"
              >
                <option>TCP</option>
                <option>UDP</option>
                <option>ICMP</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm text-gray-400">Action</label>
              <select
                name="action"
                value={form.action}
                onChange={handleChange}
                className="w-full mt-1 rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="allow">Allow</option>
                <option value="block">Block</option>
              </select>
            </div>
          </div>

          {errors.length > 0 && (
            <div className="bg-red-900/30 border border-red-700 text-red-400 text-sm rounded-md p-2">
              <ul className="list-disc list-inside">
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm text-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-sm text-white"
            >
              Save Rule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RuleEditor;
