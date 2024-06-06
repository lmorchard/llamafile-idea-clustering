export const llamafileOptions = {
  baseUrl: "http://127.0.0.1:8886",
};

export async function llamafile(path, payload, method = "POST") {
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (payload) {
    options.body = JSON.stringify(payload);
  }
  const resp = await fetch(`${llamafileOptions.baseUrl}/${path}`, options);
  return resp.json();
}

export const llamafileGET = (path) => llamafile(path, undefined, "GET");

export const llamafilePOST = (path) => llamafile(path, undefined, "POST");
