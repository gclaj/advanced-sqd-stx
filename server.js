/* Advanced Squad STX Scorecard server — zero dependencies.
   Serves the app and stores all squad scores in one JSON file.
   On Railway, attach a volume mounted at /data so scores survive redeploys. */
const http = require("http");
const fs = require("fs");
const path = require("path");
const config = require("./public/rubrics.js");

const PORT = process.env.PORT || 3000;
const DATA_DIR =
  process.env.DATA_DIR ||
  (fs.existsSync("/data") ? "/data" : path.join(__dirname, "data"));
const DATA_FILE = path.join(DATA_DIR, "state.json");

fs.mkdirSync(DATA_DIR, { recursive: true });

let state = { squads: {} };
try {
  const loaded = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  if (loaded && typeof loaded === "object" && loaded.squads) state = loaded;
} catch (e) {
  /* first boot: no state file yet */
}

function persist() {
  try {
    fs.writeFileSync(DATA_FILE + ".tmp", JSON.stringify(state));
    fs.renameSync(DATA_FILE + ".tmp", DATA_FILE);
  } catch (e) {
    console.error("Failed to write state:", e.message);
  }
}

const INDEX = fs.readFileSync(path.join(__dirname, "public", "index.html"));
const RUBRICS = fs.readFileSync(path.join(__dirname, "public", "rubrics.js"));

const VALID_SQUADS = config.SQUADS;
const VALID_SECTIONS = ["tlp"].concat(config.LANES.map((l) => l.id));

http
  .createServer((req, res) => {
    const url = req.url.split("?")[0];
    if (req.method === "GET" && (url === "/" || url === "/index.html")) {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" });
      res.end(INDEX);
      return;
    }
    if (req.method === "GET" && url === "/rubrics.js") {
      res.writeHead(200, { "Content-Type": "text/javascript; charset=utf-8", "Cache-Control": "no-cache" });
      res.end(RUBRICS);
      return;
    }
    if (req.method === "GET" && url === "/api/state") {
      res.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "no-store" });
      res.end(JSON.stringify(state));
      return;
    }
    if (req.method === "POST" && url === "/api/section") {
      let body = "";
      req.on("data", (c) => {
        body += c;
        if (body.length > 1e6) req.destroy();
      });
      req.on("end", () => {
        try {
          const { squad, section, data } = JSON.parse(body);
          if (typeof squad !== "string" || VALID_SQUADS.indexOf(squad) < 0) throw new Error();
          if (VALID_SECTIONS.indexOf(section) < 0) throw new Error();
          if (data === null) {
            /* data:null clears that grade sheet (used to wipe practice/test runs) */
            if (state.squads[squad]) {
              delete state.squads[squad][section];
              if (Object.keys(state.squads[squad]).length === 0) delete state.squads[squad];
            }
          } else {
            if (!data || typeof data !== "object" || data.scores === null || typeof data.scores !== "object") throw new Error();
            if (!state.squads[squad]) state.squads[squad] = {};
            state.squads[squad][section] = data;
          }
          persist();
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(state));
        } catch (e) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end('{"error":"bad request"}');
        }
      });
      return;
    }
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  })
  .listen(PORT, () => console.log("STX Scorecard listening on :" + PORT));
