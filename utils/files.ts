export const getFileUrl = async (cid: string) => {
  const urlRequest = await fetch("/api/sign", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ cid: cid }),
  });
  const url = await urlRequest.json();

  return url;
};
