const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
  modifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  timestamp: { type: Date, default: Date.now },
  changeType: { type: String, required: true },
  updates: [
    {
      field: { type: String, required: true },
      oldValue: { type: mongoose.Schema.Types.Mixed },
      newValue: { type: mongoose.Schema.Types.Mixed },
    },
  ],
});

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

module.exports = { AuditLog };
