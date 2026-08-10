const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Extracts "owner" and "repo" from a full GitHub URL
function parseGithubUrl(repoUrl) {
  const cleaned = repoUrl.replace(/\/$/, "").replace(/\.git$/, "");
  const parts = cleaned.split("/");
  const owner = parts[parts.length - 2];
  const repo = parts[parts.length - 1];
  return { owner, repo };
}

// Fetches the contents of a single folder path in the repo
async function getContents(owner, repo, path = "") {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

// Fetches and decodes a single file's actual text content
async function getFileContent(owner, repo, filePath) {
  const data = await getContents(owner, repo, filePath);
  return Buffer.from(data.content, "base64").toString("utf-8");
}

// A safe list of extensions we actually want to process (skip images, binaries, etc.)
const ALLOWED_EXTENSIONS = [".js", ".jsx", ".ts", ".tsx", ".py", ".java", ".md"];

function isRelevantFile(fileName) {
  return ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext));
}

// Recursively walks the ENTIRE repo, collecting relevant files with their content
async function walkRepo(owner, repo, path = "") {
  const items = await getContents(owner, repo, path);
  let allFiles = [];

  for (const item of items) {
    if (item.type === "dir") {
      if (["node_modules", ".git", "dist", "build"].includes(item.name)) {
        continue;
      }
      const nestedFiles = await walkRepo(owner, repo, item.path);
      allFiles = allFiles.concat(nestedFiles);
    } else if (item.type === "file" && isRelevantFile(item.name)) {
      const content = await getFileContent(owner, repo, item.path);
      allFiles.push({
        fileName: item.path,
        content: content,
      });
    }
  }

  return allFiles;
}

module.exports = { parseGithubUrl, walkRepo };