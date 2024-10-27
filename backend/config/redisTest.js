const redis = require("./redis"); // Adjust path if necessary

(async () => {
  try {
    await redis.set("testKey", "Hello Redis!", "EX", 10); // Expire in 10 seconds
    console.log("SET command successful.");

    const value = await redis.get("testKey");
    console.log("GET command result:", value);

    redis.quit();
  } catch (err) {
    console.error("Redis error:", err);
  }
})();
