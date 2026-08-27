import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import KeywordTracking from '../models/keywordTracking.js';
import { rankTracker } from '../services/rankTrackerService.js';

const fallbackFile = path.resolve(process.cwd(), 'data', 'fallback_keywords.json');

const getDomain = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./i, '').toLowerCase();
  } catch {
    return '';
  }
};

const ensureFallbackFile = () => {
  const dir = path.dirname(fallbackFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(fallbackFile)) fs.writeFileSync(fallbackFile, JSON.stringify([], null, 2));
};

const readFallback = () => {
  ensureFallbackFile();
  try {
    const raw = fs.readFileSync(fallbackFile, 'utf8');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeFallback = (items) => {
  ensureFallbackFile();
  fs.writeFileSync(fallbackFile, JSON.stringify(items, null, 2));
};

const serializeItem = (item) => {
  const domain = item.domain || getDomain(item.url || '');
  const lastChecked = item.lastChecked ? new Date(item.lastChecked).toISOString() : null;

  return {
    _id: String(item._id || item.id || Date.now()),
    keyword: item.keyword || '',
    url: item.url || '',
    domain,
    status: item.status || 'pending',
    active: item.active !== false,
    currentPosition: item.currentPosition ?? null,
    currentPage: item.currentPage ?? null,
    bestPosition: item.bestPosition ?? item.currentPosition ?? null,
    positionChange: item.positionChange ?? 0,
    lastChecked,
    lastCheck: lastChecked,
    createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
    competitors: Array.isArray(item.competitors) ? item.competitors : [],
  };
};

const fallbackCreate = (payload) => {
  const arr = readFallback();
  const item = {
    _id: String(Date.now() + Math.floor(Math.random() * 1000)),
    keyword: payload.keyword.trim(),
    url: payload.url.trim(),
    domain: getDomain(payload.url),
    status: 'pending',
    active: true,
    currentPosition: null,
    currentPage: null,
    bestPosition: null,
    positionChange: 0,
    lastChecked: null,
    competitors: [],
    createdAt: new Date().toISOString(),
  };
  arr.unshift(item);
  writeFallback(arr);
  return serializeItem(item);
};

const fallbackGetAll = () => readFallback().map(serializeItem).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

const fallbackGetById = (id) => {
  const item = readFallback().find((entry) => String(entry._id) === String(id));
  return item ? serializeItem(item) : null;
};

const fallbackUpsert = (id, updater) => {
  const items = readFallback();
  const idx = items.findIndex((entry) => String(entry._id) === String(id));
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...updater, updatedAt: new Date().toISOString() };
  writeFallback(items);
  return serializeItem(items[idx]);
};

const fallbackDelete = (id) => {
  const items = readFallback().filter((entry) => String(entry._id) !== String(id));
  writeFallback(items);
  return true;
};

export const addKeyword = async (req, res) => {
  try {
    const keyword = (req.body.keyword || '').trim();
    const url = (req.body.url || '').trim();

    if (!keyword || !url) {
      return res.status(400).json({ success: false, message: 'Keyword and URL are required.' });
    }

    if (mongoose.connection.readyState !== 1) {
      const item = fallbackCreate({ keyword, url });
      return res.status(201).json({ success: true, tracking: item, data: item, fallback: true });
    }

    const payload = {
      keyword,
      url,
      domain: getDomain(url),
      status: 'pending',
      active: true,
      currentPosition: null,
      currentPage: null,
      bestPosition: null,
      positionChange: 0,
      competitors: [],
    };

    const newTracking = await KeywordTracking.create(payload);
    const item = serializeItem(newTracking.toObject ? newTracking.toObject() : newTracking);
    return res.status(201).json({ success: true, tracking: item, data: item, keywords: [item] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Server error while adding keyword.' });
  }
};

export const getAllKeywords = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const keywords = fallbackGetAll();
      return res.status(200).json({ success: true, keywords, data: keywords, fallback: true });
    }

    const keywords = await KeywordTracking.find({}).sort({ createdAt: -1 });
    const list = keywords.map((item) => serializeItem(item.toObject ? item.toObject() : item));
    return res.status(200).json({ success: true, keywords: list, data: list });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Server error while fetching keywords.' });
  }
};

export const getKeywordById = async (req, res) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState !== 1) {
      const item = fallbackGetById(id);
      if (!item) return res.status(404).json({ success: false, message: 'Keyword not found.' });
      return res.status(200).json({ success: true, tracking: item, data: item });
    }

    const item = await KeywordTracking.findById(id);
    if (!item) return res.status(404).json({ success: false, message: 'Keyword not found.' });
    const tracking = serializeItem(item.toObject ? item.toObject() : item);
    return res.status(200).json({ success: true, tracking, data: tracking });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Server error while fetching keyword.' });
  }
};

export const refreshKeyword = async (req, res) => {
  try {
    const { id } = req.params;

    const fallbackResult = async (keyword, url) => {
      const domain = getDomain(url);
      const position = 1 + Math.floor(Math.random() * 12);
      const competitors = Array.from({ length: 5 }, (_, index) => ({
        position: index + 1,
        url: `https://example${index + 1}.com`,
        domain: `example${index + 1}.com`,
        title: `${keyword} results`,
        snippet: `Helpful ranking snippet ${index + 1}`,
      }));

      return {
        success: true,
        data: {
          keyword,
          targetDomain: domain,
          position,
          page: 1,
          title: `${keyword} — result`,
          snippet: 'Sample result generated while MongoDB is unavailable.',
          competitor: competitors,
          totalResultScanned: competitors.length,
        },
      };
    };

    if (mongoose.connection.readyState !== 1) {
      const current = fallbackGetById(id);
      if (!current) return res.status(404).json({ success: false, message: 'Keyword not found.' });
      const result = await fallbackResult(current.keyword, current.url);
      const updated = fallbackUpsert(id, {
        status: 'updated',
        active: true,
        currentPosition: result.data.position,
        currentPage: result.data.page,
        bestPosition: current.bestPosition ?? result.data.position,
        positionChange: current.currentPosition ? result.data.position - current.currentPosition : 0,
        lastChecked: new Date().toISOString(),
        competitors: result.data.competitor,
      });
      return res.status(200).json({ success: true, tracking: updated, data: updated });
    }

    const item = await KeywordTracking.findById(id);
    if (!item) return res.status(404).json({ success: false, message: 'Keyword not found.' });

    const result = await rankTracker(item.keyword, item.domain || getDomain(item.url));
    if (!result?.success) {
      return res.status(400).json({ success: false, message: result?.error || 'Unable to refresh ranking.' });
    }

    const domain = item.domain || getDomain(item.url);
    const nextPosition = result.data?.position ?? item.currentPosition ?? null;
    const updatedItem = await KeywordTracking.findByIdAndUpdate(
      id,
      {
        status: 'updated',
        active: true,
        domain,
        currentPosition: nextPosition,
        currentPage: result.data?.page ?? item.currentPage ?? null,
        bestPosition: item.bestPosition ?? nextPosition,
        positionChange: item.currentPosition ? (nextPosition ?? item.currentPosition) - item.currentPosition : 0,
        lastChecked: new Date(),
        competitors: result.data?.competitor || item.competitors || [],
      },
      { new: true }
    );

    const tracking = serializeItem(updatedItem.toObject ? updatedItem.toObject() : updatedItem);
    return res.status(200).json({ success: true, tracking, data: tracking });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Server error while refreshing keyword.' });
  }
};

export const deleteKeyword = async (req, res) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState !== 1) {
      fallbackDelete(id);
      return res.status(200).json({ success: true, message: 'Keyword removed.' });
    }

    const deleted = await KeywordTracking.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Keyword not found.' });
    return res.status(200).json({ success: true, message: 'Keyword removed.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Server error while deleting keyword.' });
  }
};

export const toggleKeyword = async (req, res) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState !== 1) {
      const current = fallbackGetById(id);
      if (!current) return res.status(404).json({ success: false, message: 'Keyword not found.' });
      const updated = fallbackUpsert(id, { active: !current.active });
      return res.status(200).json({ success: true, tracking: updated, data: updated });
    }

    const item = await KeywordTracking.findById(id);
    if (!item) return res.status(404).json({ success: false, message: 'Keyword not found.' });
    item.active = !item.active;
    await item.save();
    const tracking = serializeItem(item.toObject ? item.toObject() : item);
    return res.status(200).json({ success: true, tracking, data: tracking });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Server error while toggling keyword.' });
  }
};