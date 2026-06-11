/** Send AI proxy result with original status + body. */
const sendProxyResult = (res, { status, data }) => res.status(status).json(data);

module.exports = { sendProxyResult };
