const reportService = require("../services/report.service");
const { buildNarrative, buildHtml } = require("../utils/clinicalReportBuilder");

const generate = async (req, res, next) => {
  try {
    const report = await reportService.getByCaseId(req.params.caseId);
    return res.status(200).json(report);
  } catch (err) {
    next(err);
  }
};

/** Plain-English text report for clinicians */
const downloadText = async (req, res, next) => {
  try {
    const report = await reportService.getByCaseId(req.params.caseId);
    const narrative = buildNarrative(report);
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="clinical-report-${report.case_id}.txt"`
    );
    return res.status(200).send(narrative);
  } catch (err) {
    next(err);
  }
};

/** Printable HTML report in English */
const downloadHtml = async (req, res, next) => {
  try {
    const report = await reportService.getByCaseId(req.params.caseId);
    const html = buildHtml(report);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="clinical-report-${report.case_id}.html"`
    );
    return res.status(200).send(html);
  } catch (err) {
    next(err);
  }
};

module.exports = { generate, downloadText, downloadHtml };
