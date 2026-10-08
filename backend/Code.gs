/**
 * Google Apps Script backend for "रसुवा बाढी पीडित परिवार समन्वय" (index.html)
 *
 * Stores every family submission as one row in a Google Sheet so that
 * families can submit from their own phones and the Ministry dashboard
 * (on any device) sees everything in one place.
 *
 * SETUP (about 5 minutes, see README.md):
 *  1. Create a new Google Sheet. Rename the first tab to "Submissions".
 *  2. Extensions → Apps Script. Delete the default code, paste this file, save.
 *  3. Deploy → New deployment → type "Web app".
 *       Execute as: Me        Who has access: Anyone
 *  4. Copy the Web app URL and paste it into CONFIG.API_URL in index.html.
 *  5. Re-deploy (new version) whenever you change this script.
 */

var SHEET_NAME = "Submissions";
var HEADERS = ["id", "ref", "createdAt", "employee_name", "status", "post", "applicant", "phone", "origin_district", "members", "record_json"];

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** GET ?action=list  → { ok:true, records:[...] } */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || "list";
  if (action !== "list") return json_({ ok: false, error: "unknown action" });
  var sh = getSheet_();
  var last = sh.getLastRow();
  if (last < 2) return json_({ ok: true, records: [] });
  var col = HEADERS.indexOf("record_json") + 1;
  var values = sh.getRange(2, col, last - 1, 1).getValues();
  var records = [];
  values.forEach(function (row) {
    try { if (row[0]) records.push(JSON.parse(row[0])); } catch (err) {}
  });
  return json_({ ok: true, records: records });
}

/** POST body (text/plain JSON): { action:"submit", record:{...} } */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var body = JSON.parse(e.postData.contents || "{}");
    if (body.action !== "submit" || !body.record || !body.record.id) {
      return json_({ ok: false, error: "bad request" });
    }
    var r = body.record;
    var sh = getSheet_();
    var idCol = HEADERS.indexOf("id") + 1;
    var last = sh.getLastRow();
    var rowIndex = -1;
    if (last >= 2) {
      var ids = sh.getRange(2, idCol, last - 1, 1).getValues();
      for (var i = 0; i < ids.length; i++) { if (ids[i][0] === r.id) { rowIndex = i + 2; break; } }
    }
    var statusMap = { missing: "Missing", dead: "Deceased" };
    var row = [
      r.id, r.ref, r.createdAt,
      (r.employee || {}).name || "", statusMap[(r.employee || {}).status] || "", (r.employee || {}).post || "",
      (r.applicant || {}).name || "", (r.applicant || {}).phone || "",
      ((r.applicant || {}).origin || {}).district || "",
      (r.members || []).length,
      JSON.stringify(r)
    ];
    if (rowIndex > 0) sh.getRange(rowIndex, 1, 1, row.length).setValues([row]);
    else sh.appendRow(row);
    return json_({ ok: true, id: r.id, updated: rowIndex > 0 });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}
