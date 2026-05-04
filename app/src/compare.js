var spawn = require("child_process").spawn;
var path = require("path");

function runMode(mode, value) {
  return new Promise(function (resolve, reject) {
    console.log("");
    console.log("Switching PRICING_MODE=" + value);
    console.log(Array(("Switching PRICING_MODE=" + value).length + 1).join("-"));

    var child = spawn(process.execPath, [path.join(__dirname, "index.js")], {
      stdio: "inherit",
      env: Object.assign({}, process.env, {
        PRICING_MODE: value
      })
    });

    child.on("exit", function (code) {
      if (code !== 0) {
        reject(new Error(mode + " run exited with code " + code));
        return;
      }

      resolve();
    });
  });
}

async function main() {
  await runMode("monolith", "local");
  await runMode("distributed", "remote");
}

main().catch(function (error) {
  console.error("[compare] failed:", error.message);
  process.exit(1);
});
