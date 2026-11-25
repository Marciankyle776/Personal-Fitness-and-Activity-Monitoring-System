import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import { buildFilter, buildSort } from "../utils/listQuery.js";
import { createNotification } from "../services/notification.service.js";

// Builds list / getOne / create / update / remove handlers for a user-owned model.
// Every query is scoped to req.user.id, so users can only touch their own records.
export const makeCrud = ({
  Model, label, searchFields, sortable, defaultSort,
  dateField = "date", hasTags = false, statusField,
  notifyCreate, notifyUpdate, notifyDelete,
}) => {
  const findOwned = async (id, userId) => {
    const doc = await Model.findOne({ _id: id, user: userId });
    if (!doc) throw new AppError(`${label} not found`, 404);
    return doc;
  };

  const notify = (userId, payload) => (payload ? createNotification(userId, payload) : null);

  const list = asyncHandler(async (req, res) => {
    const q = req.query;
    const filter = buildFilter(req.user.id, q, { searchFields, dateField, hasTags, statusField });
    const sort = buildSort(q.sort, sortable, defaultSort);
    const [items, total] = await Promise.all([
      Model.find(filter).sort(sort).skip((q.page - 1) * q.limit).limit(q.limit),
      Model.countDocuments(filter),
    ]);
    res.json({
      success: true,
      data: {
        items,
        pagination: { page: q.page, limit: q.limit, total, pages: Math.max(1, Math.ceil(total / q.limit)) },
      },
    });
  });

  const getOne = asyncHandler(async (req, res) => {
    res.json({ success: true, data: { item: await findOwned(req.params.id, req.user.id) } });
  });

  const create = asyncHandler(async (req, res) => {
    const doc = await Model.create({ ...req.body, user: req.user.id });
    await notify(req.user.id, notifyCreate?.(doc));
    res.status(201).json({ success: true, message: `${label} created`, data: { item: doc } });
  });

  const update = asyncHandler(async (req, res) => {
    const doc = await findOwned(req.params.id, req.user.id);
    const before = doc.toObject();
    doc.set(req.body);
    await doc.save(); // runs validators and pre-save hooks (e.g. goal auto-completion)
    await notify(req.user.id, notifyUpdate?.(doc, before));
    res.json({ success: true, message: `${label} updated`, data: { item: doc } });
  });

  const remove = asyncHandler(async (req, res) => {
    const doc = await findOwned(req.params.id, req.user.id);
    await doc.deleteOne();
    await notify(req.user.id, notifyDelete?.(doc));
    res.json({ success: true, message: `${label} deleted` });
  });

  return { list, getOne, create, update, remove, findOwned };
};
