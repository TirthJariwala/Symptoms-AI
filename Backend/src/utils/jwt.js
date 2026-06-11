const decodeJwtPayload = (authorization) => {
  if (!authorization?.startsWith("Bearer ")) return null;
  const part = authorization.split(".")[1];
  if (!part) return null;
  try {
    const padded = part.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
  } catch {
    return null;
  }
};

const getUserId = (req) => {
  const payload = decodeJwtPayload(req.headers.authorization);
  return payload?.sub || null;
};

module.exports = { decodeJwtPayload, getUserId };
