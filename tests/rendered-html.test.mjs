import assert from "node:assert/strict";
import test from "node:test";

async function render(path, headers = {}) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${Math.random()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, {
      headers: { accept: "text/html", ...headers },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the default English locale", async () => {
  const response = await render("/en");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html lang="en">/);
  assert.match(html, /<title>Anatomy Atelier - Learn anatomy like an artist<\/title>/);
  assert.match(html, /Explore/);
  assert.match(html, /Organ library/);
  assert.match(html, /Kidneys/);
  assert.doesNotMatch(html, /Your site is taking shape/);
});

test("server-renders translated Spanish and Simplified Chinese locales", async () => {
  const spanish = await (await render("/es")).text();
  assert.match(spanish, /<html lang="es">/);
  assert.match(spanish, /Explorar/);
  assert.match(spanish, /Biblioteca de órganos/);
  assert.match(spanish, /Riñones/);

  const chinese = await (await render("/zh-CN")).text();
  assert.match(chinese, /<html lang="zh-CN">/);
  assert.match(chinese, /探索/);
  assert.match(chinese, /器官库/);
  assert.match(chinese, /肾脏/);
});
