
const mongoose = require("mongoose");
const CodeBatch = require("../model/QRCodeBatchSchema");
const CodeLabel = require("../model/QRCodeLabelSchema");
const { buildSequentialCodes, normalizeCode, findDuplicatesInArray } = require("../utils/QRcodeUtilityFunction");
const Asset = require("../model/assetModel");


// POST /api/code-pool/batches
// Body (examples shown later)
exports.createBatch = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      method,                 // "sequential" | "manual"
      format = "qr",          // "qr" | "barcode"
      // sequential:
      prefix = "", suffix = "", startingFrom, count, padLength,
      // manual:
      manualCodes = [],
      // optional context:
      productTypeId, productId, siteId,
      comments,
      createdBy,
    } = req.body;

    if (!["sequential","manual"].includes(method)) {
      return res.status(400).json({ message: "Invalid method" });
    }
    if (!["qr","barcode"].includes(format)) {
      return res.status(400).json({ message: "Invalid format" });
    }

    let codes = [];
    if (method === "sequential") {
      if (typeof startingFrom !== "number" || typeof count !== "number") {
        return res.status(400).json({ message: "startingFrom and count are required for sequential" });
      }
      codes = buildSequentialCodes({ prefix, suffix, startingFrom, count, padLength });
    } else {
      codes = (manualCodes || []).map(normalizeCode).filter(Boolean);
      if (!codes.length) return res.status(400).json({ message: "manualCodes is empty" });
    }

    // check duplicates in input
    const localDups = findDuplicatesInArray(codes);
    if (localDups.length) {
      return res.status(409).json({ message: "Duplicate codes in request", duplicates: localDups });
    }

    // check collisions in DB
    const existing = await CodeLabel.find({ code: { $in: codes } }, { code: 1 }).session(session);
    if (existing.length) {
      return res.status(409).json({
        message: "Some codes already exist in pool",
        duplicates: existing.map(e => e.code)
      });
    }

    // Create batch
    const [batch] = await CodeBatch.create([{
      method, format, prefix, suffix, startingFrom, count, padLength,
      manualCodes: method === "manual" ? codes : [],
      productTypeId, productId, siteId,
      comments, createdBy,
      generatedCount: codes.length
    }], { session });

    // Insert code labels: available in pool
    const now = new Date();
    const ops = codes.map(code => ({
      insertOne: {
        document: {
          code, format, state: "available",
          batchId: batch._id,
          context: { productTypeId, productId, siteId },
          comments,
          createdAt: now, updatedAt: now
        }
      }
    }));
    await CodeLabel.bulkWrite(ops, { session });

    await session.commitTransaction();
    session.endSession();
    return res.status(201).json({
      message: "Batch created and codes stored",
      batchId: batch._id,
      generatedCount: codes.length
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    return res.status(500).json({ message: "Internal error", error: err.message });
  }
};

// GET /api/code-pool/available?format=qr&limit=100&productId=...
exports.listAvailable = async (req, res) => {
  try {
    const { format, productTypeId, productId, siteId, limit = 100 } = req.query;
    const q = { state: "available", isActive: true };
    if (format) q.format = format;
    if (productTypeId) q["context.productTypeId"] = productTypeId;
    if (productId) q["context.productId"] = productId;
    if (siteId) q["context.siteId"] = siteId;

    const codes = await CodeLabel.find(q)
      .sort({ createdAt: 1 })
      .limit(Number(limit));

    return res.json({ count: codes.length, codes });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal error", error: err.message });
  }
};


// POST /api/code-pool/reserve
// body: { codes: ["A-001","A-002"] }
exports.reserveCodes = async (req, res) => {
  try {
    const { codes = [] } = req.body;
    if (!codes.length) return res.status(400).json({ message: "codes array required" });

    const result = await CodeLabel.updateMany(
      { code: { $in: codes }, state: "available", isActive: true },
      { $set: { state: "reserved" } }
    );
    return res.json({ message: "Reserved", matched: result.matchedCount, modified: result.modifiedCount });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal error", error: err.message });
  }
};






exports.assignCodes = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { pairs = [], mappingField = "assetCode" } = req.body;
    if (!pairs.length) return res.status(400).json({ message: "pairs array required" });
    if (!["assetCode","serialNumber","assetTag"].includes(mappingField)) {
      return res.status(400).json({ message: "Invalid mappingField" });
    }

    // Pull all codes involved, ensure they are available/reserved (not assigned)
    const codesIn = pairs.map(p => p.code);
    const codeDocs = await CodeLabel.find({ code: { $in: codesIn }, isActive: true })
      .session(session);

    const codeMap = new Map(codeDocs.map(c => [c.code, c]));
    const notFound = codesIn.filter(c => !codeMap.has(c));
    if (notFound.length) {
      return res.status(404).json({ message: "Codes not found", codes: notFound });
    }

    // Validate states
    const badState = [];
    for (const c of codeDocs) {
      if (!["available","reserved"].includes(c.state)) badState.push(c.code);
    }
    if (badState.length) {
      return res.status(409).json({ message: "Some codes are not available/reserved", codes: badState });
    }

    // Ensure no mappingField clashes
    const collisions = await Asset.find(
      { [mappingField]: { $in: codesIn } },
      { _id: 1, [mappingField]: 1 }
    ).session(session);
    if (collisions.length) {
      return res.status(409).json({
        message: `Some ${mappingField} values already used`,
        items: collisions.map(a => ({ assetId: a._id.toString(), value: a[mappingField] }))
      });
    }

    // Bulk update assets
    const now = new Date();
    const assetOps = pairs.map(p => ({
      updateOne: {
        filter: { _id: p.assetId },
        update: { $set: { [mappingField]: p.code, updatedAt: now } }
      }
    }));
    const assetResult = await Asset.bulkWrite(assetOps, { session });

    // Bulk update codes -> assigned + link asset
    const codeOps = pairs.map(p => ({
      updateOne: {
        filter: { code: p.code },
        update: { $set: { state: "assigned", mappedTo: p.assetId, updatedAt: now } }
      }
    }));
    const codeResult = await CodeLabel.bulkWrite(codeOps, { session });

    await session.commitTransaction();
    session.endSession();

    return res.json({
      message: "Codes assigned",
      assetsUpdated: assetResult.modifiedCount,
      codesUpdated: codeResult.modifiedCount
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    return res.status(500).json({ message: "Internal error", error: err.message });
  }
};

// POST /api/code-pool/unassign
exports.unassignCode = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: "code required" });

    const label = await CodeLabel.findOne({ code }).session(session);
    if (!label) return res.status(404).json({ message: "Code not found" });
    if (label.state !== "assigned" || !label.mappedTo) {
      return res.status(409).json({ message: "Code is not assigned" });
    }

    // Clear from asset (we assume mappingField was assetCode; if needed, store mappingField in label.context)
    const Asset = require("../models/Asset");
    await Asset.updateOne({ _id: label.mappedTo, assetCode: code }, { $unset: { assetCode: "" } }, { session });

    await CodeLabel.updateOne({ _id: label._id }, { $set: { state: "available" }, $unset: { mappedTo: "" } }, { session });

    await session.commitTransaction();
    session.endSession();
    return res.json({ message: "Code unassigned and returned to pool" });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    return res.status(500).json({ message: "Internal error", error: err.message });
  }
};