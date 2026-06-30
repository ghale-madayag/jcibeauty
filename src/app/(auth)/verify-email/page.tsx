import { VerifyEmailClient } from "./verify-email-client";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ uid?: string; token?: string }>;
}) {
  const sp = await searchParams;
  const uid = typeof sp.uid === "string" ? sp.uid : "";
  const token = typeof sp.token === "string" ? sp.token : "";

  return <VerifyEmailClient uid={uid} token={token} />;
}
