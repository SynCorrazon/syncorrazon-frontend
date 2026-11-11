import { extractYouTubeVideoId } from "./youtube";

describe("extractYouTubeVideoId", () => {
  it.each([
    ["https://www.youtube.com/watch?v=abcdefghijk&t=20", "abcdefghijk"],
    ["https://youtu.be/abcdefghijk?feature=shared", "abcdefghijk"],
    ["https://youtube.com/embed/abcdefghijk", "abcdefghijk"],
    ["https://youtube.com/shorts/abcdefghijk", "abcdefghijk"],
    ["https://youtube.com/live/abcdefghijk", "abcdefghijk"],
  ])("extracts the ID from %s", (url, expectedId) => {
    expect(extractYouTubeVideoId(url)).toBe(expectedId);
  });

  it.each([
    "https://youtube.com.evil.example/watch?v=abcdefghijk",
    "https://example.com/watch?v=abcdefghijk",
    "javascript:alert(1)",
    "not a URL",
    "https://youtube.com/watch?v=too-short",
  ])("rejects unsupported URL %s", (url) => {
    expect(extractYouTubeVideoId(url)).toBeNull();
  });
});
